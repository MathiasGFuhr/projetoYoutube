import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Política de Privacidade | StudioHub",
  description: "Política de privacidade da plataforma StudioHub",
};

export default function PrivacidadePage() {
  return (
    <main className="min-h-screen bg-[#050505] text-zinc-100">
      <div className="mx-auto max-w-2xl px-6 py-16">
        <Link
          href="/auth"
          className="inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-300 transition-colors mb-8"
        >
          <ArrowLeft className="size-4" />
          Voltar
        </Link>

        <h1 className="text-2xl font-bold tracking-tight text-zinc-50 mb-2">
          Política de Privacidade
        </h1>
        <p className="text-sm text-zinc-500 mb-8">
          Última atualização: 28 de maio de 2026
        </p>

        <div className="space-y-6 text-sm text-zinc-400 leading-relaxed">
          <section>
            <h2 className="text-base font-semibold text-zinc-200 mb-2">1. Dados Coletados</h2>
            <p>
              Coletamos informações necessárias para o funcionamento da plataforma, incluindo nome, e-mail, dados de canais do YouTube, vídeos e preferências de configuração. Também coletamos dados de uso da plataforma para melhorar a experiência.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-zinc-200 mb-2">2. Uso dos Dados</h2>
            <p>
              Utilizamos seus dados para: fornecer e melhorar nossos serviços, personalizar sua experiência, enviar notificações importantes sobre sua conta e garantir a segurança da plataforma.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-zinc-200 mb-2">3. Armazenamento e Segurança</h2>
            <p>
              Seus dados são armazenados em servidores seguros do Supabase com criptografia. Implementamos medidas técnicas e organizacionais para proteger suas informações contra acesso não autorizado.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-zinc-200 mb-2">4. Compartilhamento</h2>
            <p>
              Não vendemos, alugamos ou compartilhamos seus dados pessoais com terceiros, exceto quando necessário para operação da plataforma (como provedores de hospedagem) ou quando exigido por lei.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-zinc-200 mb-2">5. Seus Direitos</h2>
            <p>
              Você tem o direito de acessar, corrigir, excluir ou exportar seus dados pessoais. Pode solicitar a exclusão completa da sua conta e dados a qualquer momento.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-zinc-200 mb-2">6. Cookies</h2>
            <p>
              Utilizamos cookies essenciais para manutenção da sessão e cookies de análise para entender como os usuários interagem com a plataforma. Você pode desativar cookies em seu navegador, mas isso pode afetar a funcionalidade.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-zinc-200 mb-2">7. Alterações</h2>
            <p>
              Podemos atualizar esta política periodicamente. Alterações significativas serão comunicadas por e-mail ou notificação na plataforma.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-zinc-200 mb-2">8. Contato</h2>
            <p>
              Para questões sobre privacidade, entre em contato pelo e-mail: privacidade@studiohub.com
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
