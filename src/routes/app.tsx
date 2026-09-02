import { createFileRoute } from "@tanstack/react-router";
import { lazy, Suspense } from "react";
import { ClientOnly } from "@tanstack/react-router";
import "../talbat/app.css";

const TalbatApp = lazy(() => import("../talbat/App"));

export const Route = createFileRoute("/app")({
  head: () => ({
    meta: [
      { title: "دفتر ملابس — لوحة إدارة الطلبات" },
      {
        name: "description",
        content:
          "لوحة تحكم دفتر ملابس: تسجيل الطلبات، متابعة العرابين والمتبقي، حسابات الموردين والمرتجعات، وكشوفات جاهزة للطباعة.",
      },
      { property: "og:title", content: "دفتر ملابس — لوحة إدارة الطلبات" },
      {
        property: "og:description",
        content:
          "سجّل الطلب، تابع المتبقي، واطبع كشف الموردين من مكان واحد يعمل على كل أجهزتك.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AppRoute,
});

function AppRoute() {
  return (
    <ClientOnly>
      <Suspense fallback={null}>
        <TalbatApp />
      </Suspense>
    </ClientOnly>
  );
}
