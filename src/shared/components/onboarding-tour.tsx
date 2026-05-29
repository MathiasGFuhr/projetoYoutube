"use client";

import { useState, useEffect, useCallback } from "react";
import { Joyride, STATUS } from "react-joyride";
import type { Step, EventData } from "react-joyride";

const TOUR_COMPLETED_KEY = "studiohub-tour-completed";

const steps: Step[] = [
  {
    target: "#sidebar",
    content: "Bem-vindo ao StudioHub! Esta é sua navegação principal. Aqui você acessa todas as áreas da plataforma.",
    placement: "right",
  },
  {
    target: "#nav-0",
    content: "O Dashboard mostra a visão geral da sua operação: estatísticas, atividades recentes e status dos serviços.",
    placement: "right",
  },
  {
    target: "#nav-1",
    content: "No Calendário você visualiza e organiza as datas de publicação dos seus vídeos em todos os canais.",
    placement: "right",
  },
  {
    target: "#nav-2",
    content: "Em Canais você cadastra e gerencia todos os seus canais do YouTube e seus respectivos nichos.",
    placement: "right",
  },
  {
    target: "#nav-3",
    content: "A área de Publicados registra o histórico de todos os vídeos que já foram publicados.",
    placement: "right",
  },
  {
    target: "#nav-4",
    content: "Em Ideias você armazena e organiza as ideias de vídeos para não perder nenhuma inspiração.",
    placement: "right",
  },
  {
    target: "#sidebar-preferences",
    content: "Aqui ficam as Preferências: Planos (assine ou gerencie sua assinatura), Configurações e Suporte.",
    placement: "right",
  },
  {
    target: "#sidebar-user",
    content: "Seu perfil fica aqui. Clique para acessar configurações ou use o botão Desconectar para sair.",
    placement: "right",
  },
];

export function OnboardingTour() {
  const [run, setRun] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const completed = localStorage.getItem(TOUR_COMPLETED_KEY);
    if (!completed) {
      const timer = setTimeout(() => setRun(true), 800);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleEvent = useCallback((data: EventData) => {
    const { status } = data;
    if (status === STATUS.FINISHED || status === STATUS.SKIPPED) {
      localStorage.setItem(TOUR_COMPLETED_KEY, "true");
      setRun(false);
    }
  }, []);

  if (!mounted) return null;

  return (
    <Joyride
      steps={steps}
      run={run}
      onEvent={handleEvent}
      continuous
      options={{
        arrowColor: "#18181b",
        backgroundColor: "#18181b",
        overlayColor: "rgba(0, 0, 0, 0.65)",
        primaryColor: "#ef4444",
        textColor: "#e4e4e7",
        zIndex: 1000,
        width: 320,
        buttons: ["back", "skip", "primary"],
        showProgress: true,
      }}
      locale={{
        back: "Voltar",
        close: "Fechar",
        last: "Finalizar",
        next: "Próximo",
        skip: "Pular",
        open: "Abrir",
      }}
      styles={{
        tooltip: {
          borderRadius: 16,
          padding: "20px",
          fontSize: "14px",
          lineHeight: "1.6",
        },
        tooltipTitle: {
          fontWeight: 700,
          fontSize: "15px",
          marginBottom: "8px",
        },
        buttonPrimary: {
          backgroundColor: "#ef4444",
          borderRadius: 10,
          padding: "8px 16px",
          fontSize: "13px",
          fontWeight: 600,
        },
        buttonBack: {
          color: "#a1a1aa",
          fontSize: "13px",
          marginRight: "8px",
        },
        buttonSkip: {
          color: "#71717a",
          fontSize: "12px",
        },
      }}
    />
  );
}
