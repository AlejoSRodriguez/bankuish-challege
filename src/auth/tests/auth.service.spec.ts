import { Test, TestingModule } from "@nestjs/testing";
import { AuthService } from "../auth.service";
import { UsersService } from "../../users/users.service";
import { HttpService } from "@nestjs/axios";
import { lastValueFrom } from "rxjs";
import { InternalServerErrorException } from "@nestjs/common";

jest.mock("rxjs", () => ({
    ...jest.requireActual("rxjs"),
    lastValueFrom: jest.fn(),
}));

const mockUsersService = {
    findByEmail: jest.fn(),
};

const mockHttpService = {
    post: jest.fn(),
};

describe("AuthService", () => {
    let authService: AuthService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AuthService,
                { provide: UsersService, useValue: mockUsersService },
                { provide: HttpService, useValue: mockHttpService },
            ],
        }).compile();

        authService = module.get<AuthService>(AuthService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe("login", () => {
        it("should log in a user successfully", async () => {
            const mockFirebaseResponse = {
                data: {
                    idToken: "firebase-token",
                    email: "test@example.com",
                    refreshToken: "refresh-token",
                    localId: "firebase-uid",
                },
            };

            const mockLocalUser = {
                id: "db-id",
                email: "test@example.com",
                name: "Test User",
            };

            (lastValueFrom as jest.Mock).mockResolvedValue(
                mockFirebaseResponse
            );
            mockUsersService.findByEmail.mockResolvedValue(mockLocalUser);

            const result = await authService.login(
                "test@example.com",
                "password123"
            );

            expect(result).toEqual({
                firebaseData: mockFirebaseResponse.data,
                localUser: {
                    id: mockLocalUser.id,
                    email: mockLocalUser.email,
                    name: mockLocalUser.name,
                },
            });

            expect(mockHttpService.post).toHaveBeenCalledWith(
                `${process.env.FIREBASE_AUTH_DOMAIN}?key=${process.env.FIREBASE_API_KEY}`,
                {
                    email: "test@example.com",
                    password: "password123",
                    returnSecureToken: true,
                }
            );

            expect(mockUsersService.findByEmail).toHaveBeenCalledWith(
                "test@example.com"
            );
        });

        it("should throw an error if the user is not found in the local database", async () => {
            const mockFirebaseResponse = {
                data: {
                    idToken: "firebase-token",
                    email: "test@example.com",
                    refreshToken: "refresh-token",
                    localId: "firebase-uid",
                },
            };

            (lastValueFrom as jest.Mock).mockResolvedValue(
                mockFirebaseResponse
            );
            mockUsersService.findByEmail.mockResolvedValue(null);

            await expect(
                authService.login("test@example.com", "password123")
            ).rejects.toThrow(
                new InternalServerErrorException(
                    "User exists in Firebase but not in the local database."
                )
            );

            expect(mockHttpService.post).toHaveBeenCalledWith(
                `${process.env.FIREBASE_AUTH_DOMAIN}?key=${process.env.FIREBASE_API_KEY}`,
                {
                    email: "test@example.com",
                    password: "password123",
                    returnSecureToken: true,
                }
            );

            expect(mockUsersService.findByEmail).toHaveBeenCalledWith(
                "test@example.com"
            );
        });

        it("should throw an error if Firebase login fails", async () => {
            (lastValueFrom as jest.Mock).mockRejectedValue(
                new Error("Firebase error")
            );

            await expect(
                authService.login("test@example.com", "password123")
            ).rejects.toThrow(
                new InternalServerErrorException("Invalid login credentials")
            );

            expect(mockHttpService.post).toHaveBeenCalledWith(
                `${process.env.FIREBASE_AUTH_DOMAIN}?key=${process.env.FIREBASE_API_KEY}`,
                {
                    email: "test@example.com",
                    password: "password123",
                    returnSecureToken: true,
                }
            );

            expect(mockUsersService.findByEmail).not.toHaveBeenCalled();
        });
    });
});
