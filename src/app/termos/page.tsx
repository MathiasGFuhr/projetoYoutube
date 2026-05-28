import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Termos de Uso | StudioHub",
  description: "Termos de uso da plataforma StudioHub",
};

export default function TermosPage() {
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
          Termos de Uso
        </h1>
        <p className="text-sm text-zinc-500 mb-8">
          Última atualização: 28 de maio de 2026
        </p>

        <div className="space-y-6 text-sm text-zinc-400 leading-relaxed">
          <section>
            <h2 className="text-base font-semibold text-zinc-200 mb-2">1. Aceitação dos Termos</h2>
            <p>
              Ao acessar e utilizar a plataforma StudioHub, você concorda em cumprir estes Termos de Uso. Se não concordar com qualquer parte destes termos, não utilize nossos serviços.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-zinc-200 mb-2">2. Descrição do Serviço</h2>
            <p>
              O StudioHub é uma plataforma de gestão de produção de vídeos para YouTube. Oferecemos ferramentas para organização de canais, calendário editorial, pipeline de produção e gestão de conteúdo.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-zinc-200 mb-2">3. Cadastro e Conta</h2>
            <p>
              Para utilizar o StudioHub, é necessário criar uma conta fornecendo informações verdadeiras e atualizadas. Você é responsável por manter a confidencialidade de sua senha e por todas as atividades realizadas em sua conta.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-zinc-200 mb-2">4. Uso Adequado</h2>
            <p>
              Você concorda em usar o StudioHub apenas para fins legais e de acordo com estes termos. É proibido utilizar a plataforma para atividades ilegais, fraudulentas ou que violem direitos de terceiros.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-zinc-200 mb-2">5. Propriedade Intelectual</h2>
            <p>
              Todo o conteúdo disponibilizado na plataforma, incluindo design, código e marca, é propriedade do StudioHub. O usuário mantém a propriedade de todo o conteúdo que cadastrar na plataforma.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-zinc-200 mb-2">6. Limitação de Responsabilidade</h2>
            <p>
              O StudioHub é fornecido &quot;como está&quot;. Não garantimos que o serviço será ininterrupto, seguro ou livre de erros. Não nos responsabilizamos por perdas de dados causadas por falhas técnicas.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-zinc-200 mb-2">7. Alterações nos Termos</h2>
            <p>
              Podemos modificar estes termos a qualquer momento. Alterações significativas serão comunicadas por e-mail ou notificação na plataforma.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-zinc-200 mb-2">8. Contato</h2>
            <p>
              Em caso de dúvidas sobre estes termos, entre em contato pelo e-mail: suporte@studiohub.com
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
