import {
	ExceptionFilter,
	Catch,
	ArgumentsHost,
	HttpException,
	HttpStatus,
	Logger,
	BadRequestException,
	UnauthorizedException,
	ForbiddenException,
	NotFoundException,
	ConflictException,
	InternalServerErrorException,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ValidationError } from 'class-validator';

export interface ErrorResponse {
	statusCode: number;
	message: string | string[];
	error: string;
	timestamp: string;
	path: string;
	method: string;
	details?: any;
}

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
	private readonly logger = new Logger(HttpExceptionFilter.name);

	catch(exception: unknown, host: ArgumentsHost) {
		const ctx = host.switchToHttp();
		const response = ctx.getResponse<Response>();
		const request = ctx.getRequest<Request>();

		const errorResponse = this.buildErrorResponse(exception, request);

		// Log error details
		this.logError(exception, request, errorResponse);

		response.status(errorResponse.statusCode).json(errorResponse);
	}

	private buildErrorResponse(exception: unknown, request: Request): ErrorResponse {
		const timestamp = new Date().toISOString();
		const path = request.url;
		const method = request.method;

		// Handle HttpException and its subclasses
		if (exception instanceof HttpException) {
			const status = exception.getStatus();
			const exceptionResponse = exception.getResponse();

			return {
				statusCode: status,
				timestamp,
				path,
				method,
				...this.parseHttpExceptionResponse(exceptionResponse, exception),
			};
		}

		// Handle ValidationError from class-validator
		if (this.isValidationError(exception)) {
			return this.handleValidationError(exception as ValidationError[], request);
		}

		// Handle database errors
		if (this.isDatabaseError(exception)) {
			return this.handleDatabaseError(exception, request);
		}

		// Handle other known errors
		if (exception instanceof Error) {
			return {
				statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
				message: 'Internal server error',
				error: 'Internal Server Error',
				timestamp,
				path,
				method,
				details: process.env.NODE_ENV === 'development' ? exception.message : undefined,
			};
		}

		// Fallback for unknown errors
		return {
			statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
			message: 'An unexpected error occurred',
			error: 'Internal Server Error',
			timestamp,
			path,
			method,
		};
	}

	private parseHttpExceptionResponse(exceptionResponse: any, exception: HttpException) {
		if (typeof exceptionResponse === 'string') {
			return {
				message: exceptionResponse,
				error: exception.constructor.name.replace('Exception', ''),
			};
		}

		if (typeof exceptionResponse === 'object') {
			return {
				message: exceptionResponse.message || 'An error occurred',
				error: exceptionResponse.error || exception.constructor.name.replace('Exception', ''),
				details: exceptionResponse.details,
			};
		}

		return {
			message: 'An error occurred',
			error: exception.constructor.name.replace('Exception', ''),
		};
	}

	private handleValidationError(validationErrors: ValidationError[], request: Request): ErrorResponse {
		const errors = this.extractValidationMessages(validationErrors);
		
		return {
			statusCode: HttpStatus.BAD_REQUEST,
			message: errors,
			error: 'Validation Failed',
			timestamp: new Date().toISOString(),
			path: request.url,
			method: request.method,
		};
	}

	private extractValidationMessages(validationErrors: ValidationError[]): string[] {
		const messages: string[] = [];

		validationErrors.forEach((error) => {
			if (error.constraints) {
				messages.push(...Object.values(error.constraints));
			}

			if (error.children && error.children.length > 0) {
				messages.push(...this.extractValidationMessages(error.children));
			}
		});

		return messages;
	}

	private handleDatabaseError(exception: any, request: Request): ErrorResponse {
		const timestamp = new Date().toISOString();
		const path = request.url;
		const method = request.method;

		// PostgreSQL error codes
		if (exception.code === '23505') { // Unique constraint violation
			return {
				statusCode: HttpStatus.CONFLICT,
				message: 'Resource already exists',
				error: 'Conflict',
				timestamp,
				path,
				method,
				details: process.env.NODE_ENV === 'development' ? exception.detail : undefined,
			};
		}

		if (exception.code === '23503') { // Foreign key constraint violation
			return {
				statusCode: HttpStatus.BAD_REQUEST,
				message: 'Invalid reference to related resource',
				error: 'Bad Request',
				timestamp,
				path,
				method,
			};
		}

		if (exception.code === '23502') { // Not null constraint violation
			return {
				statusCode: HttpStatus.BAD_REQUEST,
				message: 'Required field is missing',
				error: 'Bad Request',
				timestamp,
				path,
				method,
			};
		}

		// Connection errors
		if (exception.code === 'ECONNREFUSED' || exception.code === 'ENOTFOUND') {
			return {
				statusCode: HttpStatus.SERVICE_UNAVAILABLE,
				message: 'Database connection error',
				error: 'Service Unavailable',
				timestamp,
				path,
				method,
			};
		}

		// Generic database error
		return {
			statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
			message: 'Database error occurred',
			error: 'Internal Server Error',
			timestamp,
			path,
			method,
			details: process.env.NODE_ENV === 'development' ? exception.message : undefined,
		};
	}

	private isValidationError(exception: unknown): boolean {
		return Array.isArray(exception) && exception.every(item => item instanceof ValidationError);
	}

	private isDatabaseError(exception: unknown): boolean {
		if (typeof exception !== 'object' || !exception) return false;
		
		const error = exception as any;
		return error.code && (
			typeof error.code === 'string' && (
				error.code.startsWith('23') || // PostgreSQL constraint violations
				error.code === 'ECONNREFUSED' ||
				error.code === 'ENOTFOUND' ||
				error.code === 'ETIMEDOUT'
			)
		);
	}

	private logError(exception: unknown, request: Request, errorResponse: ErrorResponse) {
		const { statusCode, message, error } = errorResponse;
		const logMessage = `${request.method} ${request.url} - ${statusCode} ${error}`;

		if (statusCode >= 500) {
			this.logger.error(logMessage, exception instanceof Error ? exception.stack : String(exception));
		} else if (statusCode >= 400) {
			this.logger.warn(logMessage);
		}
	}
}