import { createFileRoute } from "@tanstack/react-router";
import { lazy, Suspense } from "react";
import { ClientOnly } from "@tanstack/react-router";
import "../talbat/app.css";

const TalbatApp = lazy(() => import("../talbat/App"));

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "دفتر ملابس - إدارة الطلبات والمشتريات" },
      {
        name: "description",
        content:
          "تطبيق متطور لإدارة طلبيات محلات الملابس، رحلات الشراء والتوريد من سوق الجملة، حسابات الموردين، وإرجاع البضائع مع كشوفات قابلة للطباعة",
      },
      { property: "og:title", content: "دفتر ملابس - إدارة الطلبات والمشتريات" },
      {
        property: "og:description",
        content:
          "تطبيق متطور لإدارة طلبيات محلات الملابس، رحلات الشراء والتوريد من سوق الجملة، حسابات الموردين، وإرجاع البضائع مع كشوفات قابلة للطباعة",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <ClientOnly>
      <Suspense fallback={null}>
        <TalbatApp />
      </Suspense>
    </ClientOnly>
  );
}
