"use client";

import React from "react";
import AdminLayout from "../../admin/layout";
import AdsBuzzManager from "@/components/ads/AdsBuzzManager";

export default function MasjidAdminAdsBuzzPage() {
  return (
    <AdminLayout>
      <AdsBuzzManager isMasjidAdminView={true} />
    </AdminLayout>
  );
}
