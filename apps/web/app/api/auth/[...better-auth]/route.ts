import { auth } from '@/lib/auth';

export async function GET(request: Request) {
    return auth.handler(request);
}

export async function POST(request: Request) {
    return auth.handler(request);
}

export async function PUT(request: Request) {
    return auth.handler(request);
}

export async function DELETE(request: Request) {
    return auth.handler(request);
}

export async function PATCH(request: Request) {
    return auth.handler(request);
}
