// Seed initial program data from hardcoded promos
import db from "./db/connection.js";

async function seedPrograms() {
  try {
    const programs = [
      {
        title: "Grand Opening — Kelas Premium",
        branch: "Pettarani",
        type: "Grand Opening",
        program: "Regular 14–17",
        start_date: "2024-01-15 00:00:00",
        end_date: "2024-02-28 23:59:59",
        quota: 50,
        price: 1200000,
        perks: JSON.stringify([
          "Gratis Modul",
          "Voucher 100rb",
          "Akses AI Coach",
          "Reward Point",
        ]),
        image_url:
          "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=1471",
        wa_link: "https://wa.me/6281234567890?text=Daftar%20Grand%20Opening",
      },
      {
        title: "Promo 11.11 — Speaking Online",
        branch: "Online",
        type: "11.11 Flash Sale",
        program: "Speaking Online (1 Bulan)",
        start_date: "2024-11-11 00:00:00",
        end_date: "2024-11-11 23:59:59",
        quota: 100,
        price: 500000,
        perks: JSON.stringify([
          "Diskon 50%",
          "Akses AI Coach",
          "Sertifikat Digital",
          "Konsultasi Gratis",
        ]),
        image_url:
          "https://images.unsplash.com/photo-1531482615713-2afd69097998?q=80&w=1470",
        wa_link: "https://wa.me/6281234567890?text=Daftar%2011.11%20Promo",
      },
      {
        title: "Akhir Bulan — Project NBSN",
        branch: "Kolaka",
        type: "Akhir Bulan",
        program: "Project NBSN + Voucher 100rb",
        start_date: "2024-12-25 00:00:00",
        end_date: "2024-12-31 23:59:59",
        quota: 75,
        price: 800000,
        perks: JSON.stringify([
          "Voucher 100rb",
          "Project NBSN",
          "Gratis Modul",
          "Cashback 10%",
        ]),
        image_url:
          "https://images.unsplash.com/photo-1506784983877-45594efa4cbe?q=80&w=1468",
        wa_link:
          "https://wa.me/6281234567890?text=Daftar%20Project%20NBSN%20Akhir%20Bulan",
      },
    ];

    for (const program of programs) {
      await db.query(
        `INSERT INTO promos 
        (title, branch, type, program, start_date, end_date, quota, price, perks, image_url, wa_link, is_active) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)`,
        [
          program.title,
          program.branch,
          program.type,
          program.program,
          program.start_date,
          program.end_date,
          program.quota,
          program.price,
          program.perks,
          program.image_url,
          program.wa_link,
        ]
      );
    }

    console.log("✅ Successfully seeded", programs.length, "programs");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding programs:", error);
    process.exit(1);
  }
}

seedPrograms();
