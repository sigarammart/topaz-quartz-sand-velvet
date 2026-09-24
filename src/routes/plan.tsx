import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { TripFormWizard } from "@/components/trip-form-wizard";

export const Route = createFileRoute("/plan")({
  validateSearch: (search: Record<string, unknown>): { edit?: boolean } => ({
    edit: search.edit === true || search.edit === "1",
  }),
  component: PlanPage,
});

function PlanPage() {
  const navigate = useNavigate();
  const { edit } = Route.useSearch();

  return <TripFormWizard fresh={!edit} afterSave={() => void navigate({ to: "/trip" })} />;
}
