# Autenticação de Barbeiros

## Como funciona

O sistema de autenticação para barbeiros está implementado sem necessidade de backend complexo. Os dados dos barbeiros (usuário e senha) estão armazenados em um arquivo local.

## Arquivos criados/modificados

### Novos Arquivos:
1. **`src/data/barbers.ts`** - Database de barbeiros com usuários e senhas
2. **`src/hooks/useBarberAuth.ts`** - Hook para gerenciar autenticação (login/logout)
3. **`src/components/BarberLogin.tsx`** - Página de login para barbeiros
4. **`src/components/ProtectedRoute.tsx`** - Componente para proteger rotas autenticadas

### Arquivos Modificados:
1. **`src/App.tsx`** - Adicionadas rotas de login e proteção do painel admin
2. **`src/pages/AdminPanel.tsx`** - Adicionado botão de logout

## Credenciais de Teste

```
Usuário: joao    | Senha: senha123
Usuário: carlos  | Senha: senha456
Usuário: pedro   | Senha: senha789
```

## Fluxo de Autenticação

1. Barbeiro acessa `/barber-login`
2. Insere usuário e senha
3. Sistema valida contra `src/data/barbers.ts`
4. Se válido, armazena credenciais em `localStorage` e redireciona para `/admin`
5. Se não autenticado, rota `/admin` redireciona para `/barber-login`
6. Botão de logout remove credenciais de `localStorage` e redireciona para login

## Segurança (Nota Importante)

⚠️ **Isto é apenas para desenvolvimento/demo!**

Para produção:
- ❌ NÃO coloque senhas em código (mesmo criptografadas)
- ✅ Implemente um backend real (Node.js, Django, etc.)
- ✅ Use HTTPS obrigatoriamente
- ✅ Implemente JWT ou sessões seguras
- ✅ Valide tudo no servidor
- ✅ Armazene senhas com bcrypt/argon2

## Como adicionar novos barbeiros

Edite `src/data/barbers.ts`:

```typescript
export const barbersDatabase = [
  {
    id: "barber1",
    username: "joao",
    password: "senha123",
    name: "João Silva",
  },
  // Adicione novos barbeiros aqui
];
```

## Testando localmente

1. Inicie o projeto:
```bash
npm run dev
```

2. Navegue para `http://localhost:5173/barber-login`

3. Use uma das credenciais de teste

4. Você será redirecionado para o painel admin `/admin`
