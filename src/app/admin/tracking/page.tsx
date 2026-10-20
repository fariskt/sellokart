import { getShipments } from "@/features/shipments/lib/shipments.action";
import { TrackingClient } from "./TrackingClient";

export const metadata = {
  title: "Shipment Tracking | Admin",
  description: "Live carrier telemetry and fulfillment progress for dispatch orders.",
};

export default async function TrackingPage() {
  const allShipments = await getShipments().catch(() => []);
  const trackedShipments = allShipments.filter((s) => Boolean(s.tracking_number));

  return <TrackingClient shipments={trackedShipments} />;
}
