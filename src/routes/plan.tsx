import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { TripFormWizard } from "@/components/trip-form-wizard";

export const Route = createFileRoute("/plan")({ component: PlanPage });

function PlanPage() {
  const navigate = useNavigate();
  return <TripFormWizard fresh afterSave={() => void navigate({ to: "/trip" })} />;
}
