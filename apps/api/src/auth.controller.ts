import { Body, Controller, Get, Post, Req, Res } from "@nestjs/common";
import type { Request, Response } from "express";
import { AuthService } from "./auth.service";

const SESSION_AGE_MS = 30 * 24 * 60 * 60 * 1000;

@Controller("auth")
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post("request-otp")
  requestOtp(@Req() request: Request, @Body() body: unknown) {
    this.auth.assertTrustedOrigin(request);
    return this.auth.requestOtp(body);
  }

  @Post("verify-otp")
  async verifyOtp(@Req() request: Request, @Body() body: unknown, @Res({ passthrough: true }) response: Response) {
    this.auth.assertTrustedOrigin(request);
    const result = await this.auth.verifyOtp(body);
    response.cookie("vet_session", result.sessionToken, {
      httpOnly: true,
      secure: process.env.SESSION_COOKIE_SECURE === "true",
      sameSite: "strict",
      maxAge: SESSION_AGE_MS,
      path: "/",
    });
    return { authenticated: true, accountId: result.accountId };
  }

  @Get("me")
  async me(@Req() request: Request) {
    return { account: await this.auth.currentAccount(request) };
  }

  @Post("logout")
  async logout(@Req() request: Request, @Res({ passthrough: true }) response: Response) {
    this.auth.assertTrustedOrigin(request);
    await this.auth.logout(request);
    response.clearCookie("vet_session", {
      path: "/",
      sameSite: "strict",
      secure: process.env.SESSION_COOKIE_SECURE === "true",
      httpOnly: true,
    });
    return { authenticated: false };
  }
}
