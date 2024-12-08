import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from '../auth.service';
import { UsersService } from '../../users/users.service';
import * as admin from 'firebase-admin';
import {
  ConflictException,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { DecodedIdToken } from 'firebase-admin/auth';

jest.mock('firebase-admin', () => ({
  auth: jest.fn().mockReturnThis(),
  createUser: jest.fn(),
  verifyIdToken: jest.fn(),
}));

const mockUsersService = {
  createUser: jest.fn(),
  findOrCreateUser: jest.fn(),
};

describe('AuthService', () => {
  let authService: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: mockUsersService },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should register a user successfully', async () => {
      const mockFirebaseUser: admin.auth.UserRecord = {
        uid: 'firebase-uid',
        email: 'test@example.com',
        emailVerified: false,
        disabled: false,
        metadata: {
          lastSignInTime: null,
          creationTime: '2024-12-07T00:00:00.000Z',
          toJSON: () => ({}),
        },
        providerData: [],
        tokensValidAfterTime: null,
        toJSON: () => ({
          uid: 'firebase-uid',
          email: 'test@example.com',
        }),
      };

      const mockNewUser = {
        id: 'db-id',
        firebaseUid: 'firebase-uid',
        email: 'test@example.com',
        name: 'Test User',
      };

      jest
        .spyOn(admin.auth(), 'createUser')
        .mockResolvedValue(mockFirebaseUser);
      mockUsersService.createUser.mockResolvedValue(mockNewUser);

      const result = await authService.register(
        'test@example.com',
        'password123',
        'Test User',
      );

      expect(result).toEqual({
        message: 'User registered successfully',
        newUser: mockNewUser,
      });
      expect(admin.auth().createUser).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      });
      expect(mockUsersService.createUser).toHaveBeenCalledWith({
        firebaseUid: 'firebase-uid',
        email: 'test@example.com',
        name: 'Test User',
      });
    });

    it('should throw ConflictException if email already exists', async () => {
      jest
        .spyOn(admin.auth(), 'createUser')
        .mockRejectedValue({ code: 'auth/email-already-exists' });

      await expect(
        authService.register('test@example.com', 'password123', 'Test User'),
      ).rejects.toThrow(ConflictException);
    });

    it('should throw InternalServerErrorException for unexpected errors', async () => {
      jest
        .spyOn(admin.auth(), 'createUser')
        .mockRejectedValue(new Error('Unexpected error'));

      await expect(
        authService.register('test@example.com', 'password123', 'Test User'),
      ).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('authenticate', () => {
    it('should authenticate a user successfully', async () => {
      const mockDecodedToken: DecodedIdToken = {
        uid: 'firebase-uid',
        email: 'test@example.com',
        name: 'Test User',
        aud: 'test-audience',
        auth_time: 1620000000,
        exp: 1620003600,
        iat: 1620000000,
        iss: 'https://securetoken.google.com/test-project',
        sub: 'firebase-uid',
        firebase: {
          identities: {
            email: ['test@example.com'],
          },
          sign_in_provider: 'password',
        },
      };

      const mockUser = {
        id: 'db-id',
        firebaseUid: 'firebase-uid',
        email: 'test@example.com',
        name: 'Test User',
      };

      jest
        .spyOn(admin.auth(), 'verifyIdToken')
        .mockResolvedValue(mockDecodedToken);
      mockUsersService.findOrCreateUser.mockResolvedValue(mockUser);

      const result = await authService.authenticate('valid-token');

      expect(result).toEqual({ message: 'User authenticated', user: mockUser });
      expect(admin.auth().verifyIdToken).toHaveBeenCalledWith('valid-token');
      expect(mockUsersService.findOrCreateUser).toHaveBeenCalledWith({
        firebaseUid: 'firebase-uid',
        email: 'test@example.com',
        name: 'Test User',
      });
    });

    it('should throw UnauthorizedException for invalid token', async () => {
      jest
        .spyOn(admin.auth(), 'verifyIdToken')
        .mockRejectedValue({ code: 'auth/argument-error' });

      await expect(authService.authenticate('invalid-token')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw InternalServerErrorException for unexpected errors', async () => {
      jest
        .spyOn(admin.auth(), 'verifyIdToken')
        .mockRejectedValue(new Error('Unexpected error'));

      await expect(authService.authenticate('valid-token')).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });
});
