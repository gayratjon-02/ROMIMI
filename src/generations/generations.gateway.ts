import {
	WebSocketGateway,
	WebSocketServer,
	SubscribeMessage,
	OnGatewayConnection,
	OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Generation } from '../database/entities/generation.entity';

@WebSocketGateway({
	cors: {
		origin: process.env.FRONTEND_URL || '*',
		credentials: true,
	},
	namespace: '/generations',
})
export class GenerationsGateway implements OnGatewayConnection, OnGatewayDisconnect {
	@WebSocketServer()
	server: Server;

	private readonly logger = new Logger(GenerationsGateway.name);
	private readonly userRooms = new Map<string, Set<string>>(); // userId -> Set of generationIds

	constructor(
		@InjectRepository(Generation)
		private readonly generationsRepository: Repository<Generation>,
	) {}

	handleConnection(client: Socket) {
		this.logger.log(`Client connected: ${client.id}`);
	}

	handleDisconnect(client: Socket) {
		this.logger.log(`Client disconnected: ${client.id}`);
		// Clean up rooms
		for (const [userId, generationIds] of this.userRooms.entries()) {
			for (const generationId of generationIds) {
				client.leave(`generation:${generationId}`);
			}
		}
	}

	@SubscribeMessage('subscribe')
	async handleSubscribe(client: Socket, payload: { generationId: string; userId: string }) {
		const { generationId, userId } = payload;

		// Verify user owns this generation
		const generation = await this.generationsRepository.findOne({
			where: { id: generationId, user_id: userId },
		});

		if (!generation) {
			client.emit('error', { message: 'Generation not found or access denied' });
			return;
		}

		// Join room for this generation
		client.join(`generation:${generationId}`);

		// Track user's subscriptions
		if (!this.userRooms.has(userId)) {
			this.userRooms.set(userId, new Set());
		}
		this.userRooms.get(userId)?.add(generationId);

		this.logger.log(`Client ${client.id} subscribed to generation ${generationId}`);

		// Send current status
		client.emit('status', {
			generationId,
			status: generation.status,
			progress: this.calculateProgress(generation.visuals || []),
		});
	}

	@SubscribeMessage('unsubscribe')
	handleUnsubscribe(client: Socket, payload: { generationId: string; userId: string }) {
		const { generationId, userId } = payload;
		client.leave(`generation:${generationId}`);

		const userRooms = this.userRooms.get(userId);
		if (userRooms) {
			userRooms.delete(generationId);
			if (userRooms.size === 0) {
				this.userRooms.delete(userId);
			}
		}

		this.logger.log(`Client ${client.id} unsubscribed from generation ${generationId}`);
	}

	// Method to broadcast updates to all clients subscribed to a generation
	async broadcastUpdate(generationId: string, data: any) {
		this.server.to(`generation:${generationId}`).emit('update', {
			generationId,
			...data,
		});
	}

	private calculateProgress(visuals: any[]): number {
		if (!visuals || visuals.length === 0) return 0;
		const completed = visuals.filter((v: any) => v.status === 'completed').length;
		return Math.round((completed / visuals.length) * 100);
	}
}
