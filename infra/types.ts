import { NextRequest } from "next/server";

export interface RequestWithUser extends NextRequest {
	user?: any;
}
