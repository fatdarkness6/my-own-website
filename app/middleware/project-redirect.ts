import { findProjectId, projectPath } from "#shared/projectRoutes";

export default defineNuxtRouteMiddleware((to) => {
  const id = findProjectId(to.query.project);
  if (id) {
    const localePath = useLocalePath();
    return navigateTo(localePath(projectPath(id)), { redirectCode: 301, replace: true });
  }
});
