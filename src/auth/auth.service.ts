import {
    Injectable,
    ConflictException,
    UnauthorizedException,
    InternalServerErrorException,
} from "@nestjs/common";
import * as admin from "firebase-admin";
import { UsersService } from "../users/users.service";
import { HttpService } from "@nestjs/axios";
import { lastValueFrom } from "rxjs";

@Injectable()
export class AuthService {
    constructor(
        private readonly usersService: UsersService,
        private readonly httpService: HttpService
    ) {}

    async register(email: string, password: string, name: string) {
        try {
            const userRecord = await admin.auth().createUser({
                email,
                password,
            });

            const newUser = await this.usersService.createUser({
                firebaseUid: userRecord.uid,
                email,
                name,
            });

            return { message: "User registered successfully", newUser };
        } catch (error) {
            if (error.code === "auth/email-already-exists") {
                throw new ConflictException(
                    "The email address is already in use by another account."
                );
            }
            throw new InternalServerErrorException(
                "An unexpected error occurred while registering the user."
            );
        }
    }

    async authenticate(token: string) {
        try {
            const decodedToken = await admin.auth().verifyIdToken(token);

            const user = await this.usersService.findOrCreateUser({
                firebaseUid: decodedToken.uid,
                email: decodedToken.email,
                name: decodedToken.name || "Unknown",
            });

            return { message: "User authenticated", user };
        } catch (error) {
            if (error.code === "auth/argument-error") {
                throw new UnauthorizedException(
                    "Invalid authentication token."
                );
            }
            throw new InternalServerErrorException("Authentication failed.");
        }
    }

    async login(email: string, password: string): Promise<any> {
        const url = `${process.env.FIREBASE_AUTH_DOMAIN}?key=${process.env.FIREBASE_API_KEY}`;
        try {
            const response = await lastValueFrom(
                this.httpService.post(url, {
                    email,
                    password,
                    returnSecureToken: true,
                })
            );

            const firebaseData = response.data;

            const localUser = await this.usersService.findByEmail(email);

            if (!localUser) {
                throw new InternalServerErrorException(
                    "User exists in Firebase but not in the local database."
                );
            }

            return {
                firebaseData,
                localUser: {
                    id: localUser.id,
                    email: localUser.email,
                    name: localUser.name,
                },
            };
        } catch (error) {
            if (
                error.message ===
                "User exists in Firebase but not in the local database."
            ) {
                throw error;
            }
            throw new InternalServerErrorException("Invalid login credentials");
        }
    }
}
