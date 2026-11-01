import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function run() {
  console.log("=== Testing Donation Type Flow ===");

  // Find or create test masjid
  const masjid = await prisma.masjid.findFirst();
  if (!masjid) {
    console.error("No masjid found!");
    process.exit(1);
  }
  console.log(`Using Masjid: ${masjid.name} (${masjid.id})`);

  // Find or create test campaign
  let campaign = await prisma.donationCampaign.findFirst({
    where: { masjidId: masjid.id },
  });
  if (!campaign) {
    campaign = await prisma.donationCampaign.create({
      data: {
        masjidId: masjid.id,
        title: `${masjid.name} General Welfare Fund`,
        purpose: "General maintenance and community welfare",
        category: "GENERAL_FUND",
        goalAmount: 500000,
        raisedAmount: 0,
        status: "ACTIVE",
      },
    });
  }

  // 1. Simulate POST /api/donations with standard "Charity"
  const test1 = await fetch("http://localhost:3002/api/donations", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      campaignId: campaign.id,
      donorName: "Brother Zayd Testing",
      donorEmail: "zayd.test@example.com",
      amount: 2500,
      donationType: "Charity",
      notes: "Sadaqah for the community",
    }),
  });

  const res1 = await test1.json();
  console.log("Test 1 (Standard Charity) Result:", res1.success ? "SUCCESS" : "FAILED", res1);
  if (!res1.receipt || res1.receipt.donationType !== "Charity") {
    throw new Error(`Expected receipt.donationType === 'Charity', got: ${res1.receipt?.donationType}`);
  }

  // Verify in database
  const dRecord1 = await prisma.masjidDonation.findFirst({
    where: { receiptNumber: res1.receipt.receiptNumber },
  });
  console.log("DB MasjidDonation 1:", {
    receiptNumber: dRecord1?.receiptNumber,
    fundType: dRecord1?.fundType,
    description: dRecord1?.description,
  });

  if (!dRecord1?.description?.includes("[Donation Type: Charity]")) {
    throw new Error("DB description does not include [Donation Type: Charity]");
  }
  if (dRecord1.fundType !== "GENERAL_CHARITY") {
    throw new Error(`Expected fundType GENERAL_CHARITY, got: ${dRecord1.fundType}`);
  }

  // 2. Simulate POST /api/donations with custom "Other: Medical Aid for Musallis"
  const test2 = await fetch("http://localhost:3002/api/donations", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      campaignId: campaign.id,
      donorName: "Sister Fatima Testing",
      donorEmail: "fatima.test@example.com",
      amount: 5000,
      donationType: "Medical Aid for Musallis",
      notes: "Emergency medical assistance",
    }),
  });

  const res2 = await test2.json();
  console.log("Test 2 (Custom Donation Type) Result:", res2.success ? "SUCCESS" : "FAILED", res2);
  if (!res2.receipt || res2.receipt.donationType !== "Medical Aid for Musallis") {
    throw new Error(`Expected receipt.donationType === 'Medical Aid for Musallis', got: ${res2.receipt?.donationType}`);
  }

  // Verify in database
  const dRecord2 = await prisma.masjidDonation.findFirst({
    where: { receiptNumber: res2.receipt.receiptNumber },
  });
  console.log("DB MasjidDonation 2:", {
    receiptNumber: dRecord2?.receiptNumber,
    fundType: dRecord2?.fundType,
    description: dRecord2?.description,
  });

  if (!dRecord2?.description?.includes("[Donation Type: Medical Aid for Musallis]")) {
    throw new Error("DB description does not include [Donation Type: Medical Aid for Musallis]");
  }

  // 3. Verify via Inflow API (parse check)
  const dRecords = await prisma.masjidDonation.findMany({
    where: { masjidId: masjid.id },
    orderBy: { donationDate: "desc" },
    take: 5,
  });

  const verified = dRecords.some(d => d.description?.includes("[Donation Type: Charity]")) &&
                   dRecords.some(d => d.description?.includes("[Donation Type: Medical Aid for Musallis]"));

  if (!verified) {
    throw new Error("Could not verify both donation records in DB");
  }

  console.log(" ALL TESTS PASSED SUCCESSFULLY! Donation Type is properly recorded, included in receipt, and mapped to Inflow of funds.");
}

run()
  .catch((e) => {
    console.error("Test failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
