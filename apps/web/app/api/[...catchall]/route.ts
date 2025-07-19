import { createErrorResponse } from "@/lib/api-errors";

export async function GET() {
    return createErrorResponse("NOT_FOUND", "API endpoint not found");
}

export async function POST() {
    return createErrorResponse("NOT_FOUND", "API endpoint not found");
}

export async function PUT() {
    return createErrorResponse("NOT_FOUND", "API endpoint not found");
}

export async function DELETE() {
    return createErrorResponse("NOT_FOUND", "API endpoint not found");
}

export async function PATCH() {
    return createErrorResponse("NOT_FOUND", "API endpoint not found");
}
