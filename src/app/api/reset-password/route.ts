import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function POST(req: NextRequest) {
  try {
    if (!SERVICE_ROLE_KEY) {
      return NextResponse.json(
        { error: "SUPABASE_SERVICE_ROLE_KEY não configurada" },
        { status: 500 }
      );
    }

    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "E-mail e senha são obrigatórios" },
        { status: 400 }
      );
    }

    const adminClient = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // Buscar usuário pelo email
    const { data: users, error: listError } =
      await adminClient.auth.admin.listUsers();

    if (listError) {
      console.error("[reset-password] listUsers error:", listError);
      return NextResponse.json(
        { error: "Erro ao buscar usuário" },
        { status: 500 }
      );
    }

    const user = users.users.find((u) => u.email === email);

    if (!user) {
      return NextResponse.json(
        { error: "Usuário não encontrado" },
        { status: 404 }
      );
    }

    // Atualizar senha
    const { error: updateError } = await adminClient.auth.admin.updateUserById(
      user.id,
      { password }
    );

    if (updateError) {
      console.error("[reset-password] updateUser error:", updateError);
      return NextResponse.json(
        { error: updateError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("[reset-password] unexpected error:", err);
    return NextResponse.json(
      { error: err.message || "Erro interno" },
      { status: 500 }
    );
  }
}
