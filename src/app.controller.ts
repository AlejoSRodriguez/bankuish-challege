import { Controller, Get } from "@nestjs/common";
import { AppService } from "./app.service";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";

@ApiTags("App")
@Controller()
export class AppController {
    constructor(private readonly appService: AppService) {}

    @Get()
    @ApiOperation({ summary: "Get application status" })
    @ApiResponse({
        status: 200,
        description: "Returns the status of the application",
        schema: {
            example: "I'm Alive!",
        },
    })
    getStatus(): string {
        return this.appService.getStatus();
    }
}
