// app/api/users/me/route.ts
import { NextResponse } from 'next/server';
import { getPayload } from 'payload';
import config from '@payload-config';
import { cookies } from 'next/headers';

export async function GET(request: Request) {
  try {
    const payload = await getPayload({ config });
    
    // Get the token from cookies
    const cookieStore = cookies();
    const token = (await cookieStore).get('payload-token')?.value;
    
    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Get user from the auth method
    const { user } = await payload.auth({
      headers: request.headers,
    });
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }
    
    // Fetch the user with relationships
    const userWithRelations = await payload.findByID({
      collection: 'users',
      id: user.id,
      depth: 2, // Fetch related pets
    });
    
    return NextResponse.json({
      user: userWithRelations,
    });
    
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}