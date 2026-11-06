# Flujo de trabajo con Git y GitHub

## Primer push

```bash
git init
git add .
git commit -m "chore: estructura inicial de Trama"
git branch -M main
git remote add origin git@github.com:<tu-usuario>/trama-ecommerce.git
git push -u origin main
```

Después de `npm install`, commiteá `package-lock.json` y cambiá `npm install` por `npm ci` en
`.github/workflows/ci.yml` para builds reproducibles.

## Ramas

- `main`: siempre deployable. Protegerla en GitHub (*Settings → Branches*) para exigir PR y CI en verde.
- Una rama por historia de Jira, con la clave al principio: `TRAMA-12-carrito-promociones`.
  Si conectás Jira con GitHub, la rama, los commits y el PR aparecen solos dentro del ticket.

## Commits convencionales

```
feat(TRAMA-12): aplica 3x2 en el carrito
fix(TRAMA-20): corrige redondeo de cuotas
docs: agrega guía de deploy
refactor(api): separa controladores de rutas
test(pricing): cubre cupones vencidos
```

Tipos: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`.

## Pull requests

1. Título con la clave de Jira y qué cambia.
2. Descripción: qué, por qué, cómo probarlo y captura si hay cambios visuales.
3. CI en verde (lint + tests + build) antes de mergear.
4. *Squash and merge* para mantener `main` con un commit por historia.
