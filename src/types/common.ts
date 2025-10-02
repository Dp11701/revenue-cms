type ProductPayload = {
  name: string;
  package_id: string;
  project_id: string;
  provider: "google_play_billing" | "apple_store" | "stripe";
  type: "subscription" | "live_time" | "consumable" | "non_consumable";
  status: "published" | "draft" | "archive";
};

export type { ProductPayload };
