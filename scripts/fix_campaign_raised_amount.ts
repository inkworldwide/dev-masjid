import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const campaigns = await prisma.donationCampaign.findMany({
    include: { donations: true },
  });

  for (const c of campaigns) {
    const totalDonated = c.donations.reduce((sum, d) => sum + Number(d.amount), 0);
    console.log(`Campaign: "${c.title}" (${c.id}) | Current Raised: ${c.raisedAmount} | Actual Donations Sum: ${totalDonated}`);
    
    // Reset raisedAmount to actual sum of donations
    await prisma.donationCampaign.update({
      where: { id: c.id },
      data: { raisedAmount: totalDonated },
    });
    console.log(`  -> Updated raisedAmount to ${totalDonated}`);
  }
}

main()
  .catch((e) => console.error(e))
  .finally(() => prisma.$disconnect());
