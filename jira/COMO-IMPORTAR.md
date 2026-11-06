# Importar el backlog de Trama en Jira

El archivo `trama-jira.csv` tiene 79 ítems: 9 épicas, 27 historias, 22 tareas y 21 subtareas,
con jerarquía (épica → historia/tarea → subtarea), prioridad, story points, labels y estado.

- **Status `Done`:** ya está implementado en el código de este repositorio.
- **Status `To Do`:** trabajo pendiente (deploy, panel admin, tests de integración, emails, etc.).

## Pasos (Jira Cloud)

1. Crear el proyecto: plantilla **Scrum**, clave sugerida **`TRAMA`** (así las ramas y commits del
   [flujo de Git](../docs/GIT.md) se vinculan solos).
2. Ir a **Filtros → Importar elementos desde CSV** (o *Configuración → Sistema → Importación externa → CSV*
   si sos admin del sitio).
3. Subir `trama-jira.csv`, codificación **UTF-8**, separador **coma**.
4. Elegir el proyecto `TRAMA` y mapear las columnas:

| Columna del CSV | Campo de Jira |
|-----------------|---------------|
| Issue Id | Issue ID (Id. del elemento) |
| Parent Id | Parent ID (Id. del principal) |
| Issue Type | Issue Type |
| Summary | Summary |
| Epic Name | Epic Name (solo proyectos gestionados por la empresa; en los de equipo, no mapear) |
| Description | Description |
| Priority | Priority |
| Story Points | Story Points / Story point estimate |
| Status | Status (marcar "Map field value": To Do → Por hacer, Done → Finalizada si tu Jira está en español) |
| Labels (todas) | Labels |

5. Confirmar e importar. Las subtareas quedan colgando de su historia y las historias de su épica.

> Si Jira avisa que el tipo **Sub-task** no existe, en proyectos de equipo se llama **Subtask**: mapealo en
> el paso de valores, o reemplazá el texto en el CSV antes de importar.
