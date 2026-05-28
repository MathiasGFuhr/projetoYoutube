# Configuração do Stripe Webhook — StudioHub

## URL do Webhook

```
https://cvxbqoyqybdvkcjqjrau.supabase.co/functions/v1/stripe-webhook
```

## Variáveis de Ambiente (Supabase Dashboard)

Acesse: **Project Settings > Functions > Secrets**

Adicione estas secrets:

| Secret | Valor | Onde encontrar |
|---|---|---|
| `STRIPE_WEBHOOK_SECRET` | `whsec_...` | Stripe Dashboard > Developers > Webhooks > Signing secret |
| `STRIPE_SECRET_KEY` | `sk_live_...` ou `sk_test_...` | Stripe Dashboard > Developers > API keys |

## Configuração no Stripe Dashboard

1. Vá em **Developers > Webhooks**
2. Clique **Add an endpoint**
3. Endpoint URL: `https://cvxbqoyqybdvkcjqjrau.supabase.co/functions/v1/stripe-webhook`
4. Selecione os eventos:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.paid`
   - `invoice.payment_failed`
5. Salve e copie o **Signing secret** (whsec_...)
6. Cole no Supabase como `STRIPE_WEBHOOK_SECRET`

## Eventos Processados

| Evento | Ação |
|---|---|
| `checkout.session.completed` | Cria/ativa assinatura no Supabase |
| `customer.subscription.created` | Sincroniza nova assinatura |
| `customer.subscription.updated` | Atualiza status, datas, plano |
| `customer.subscription.deleted` | Marca como `canceled` |
| `invoice.paid` | Confirma status `active` |
| `invoice.payment_failed` | Marca como `past_due` |

## Segurança

- Validação de `stripe-signature` em TODAS as requisições
- Respostas genéricas para evitar reconnaissance
- Logs detalhados no console (visíveis no Supabase Logs)
- JWT desabilitado (Stripe não envia JWT)
- Service role key isolado no server-side

## Testando o Webhook

### Stripe CLI (local)
```bash
# Login no Stripe
stripe login

# Forward webhooks para localhost
stripe listen --forward-to https://cvxbqoyqybdvkcjqjrau.supabase.co/functions/v1/stripe-webhook

# Teste um evento
stripe trigger checkout.session.completed
```

### Teste via Dashboard
1. Stripe Dashboard > Webhooks > Seu endpoint
2. Clique **Send test event**
3. Selecione um evento e envie

## Troubleshooting

| Problema | Causa | Solução |
|---|---|---|
| `401 Unauthorized` | Sem `stripe-signature` | Verificar se Stripe está enviando o header |
| `400 Webhook Error` | Assinatura inválida | Verificar `STRIPE_WEBHOOK_SECRET` no Supabase |
| `500 Server misconfigured` | Secret não configurada | Adicionar `STRIPE_WEBHOOK_SECRET` nas secrets |
| Assinatura não atualiza | user_id não encontrado | Verificar `client_reference_id` no checkout |
| Plano não encontrado | Price ID não cadastrado | Verificar `stripe_price_id` na tabela `plans` |

## Logs

Acesse os logs da função em:
**Supabase Dashboard > Edge Functions > stripe-webhook > Logs**

Ou via CLI:
```bash
npx supabase functions logs stripe-webhook --tail
```
