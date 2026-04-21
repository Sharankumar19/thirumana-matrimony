// // scripts/seed.ts — Seed religions, castes, subcastes
// import { connectDB } from '../lib/db';
// import { Religion, Caste, SubCaste, syncModels } from '../models';

// const seedData = [
//   {
//     name: 'Hindu',
//     castes: [
//       { name: 'Brahmin', subcastes: ['Iyer', 'Iyengar', 'Namboothiri', 'Saraswat'] },
//       { name: 'Kshatriya', subcastes: ['Rajput', 'Maratha', 'Nair'] },
//       { name: 'Vaishya', subcastes: ['Agarwal', 'Marwari', 'Baniya'] },
//       { name: 'Kayastha', subcastes: ['Srivastava', 'Mathur', 'Saxena'] },
//       { name: 'Lingayat', subcastes: ['Veerashaiva', 'Panchamasali'] },
//       { name: 'Vokkaliga', subcastes: ['Gowda', 'Morasu'] },
//     ],
//   },
//   {
//     name: 'Muslim',
//     castes: [
//       { name: 'Sunni', subcastes: ['Hanafi', 'Shafi', 'Maliki'] },
//       { name: 'Shia', subcastes: ['Ithna Ashari', 'Ismaili'] },
//       { name: 'Syed', subcastes: ['Naqvi', 'Rizvi'] },
//       { name: 'Sheikh', subcastes: ['Ansari', 'Siddiqui'] },
//     ],
//   },
//   {
//     name: 'Christian',
//     castes: [
//       { name: 'Catholic', subcastes: ['Roman Catholic', 'Syrian Catholic'] },
//       { name: 'Protestant', subcastes: ['Methodist', 'Baptist', 'Lutheran'] },
//       { name: 'Orthodox', subcastes: ['Syrian Orthodox', 'Greek Orthodox'] },
//     ],
//   },
//   {
//     name: 'Sikh',
//     castes: [
//       { name: 'Jat Sikh', subcastes: ['Sidhu', 'Gill', 'Grewal'] },
//       { name: 'Khatri Sikh', subcastes: ['Arora', 'Bhatia'] },
//       { name: 'Ramgarhia', subcastes: ['Tarkhan', 'Lohar'] },
//     ],
//   },
//   {
//     name: 'Jain',
//     castes: [
//       { name: 'Digambara', subcastes: ['Gome', 'Kamboji'] },
//       { name: 'Shwetambara', subcastes: ['Murtipujak', 'Sthanakvasi'] },
//     ],
//   },
//   {
//     name: 'Buddhist',
//     castes: [
//       { name: 'Theravada', subcastes: ['Vipassana', 'Zen'] },
//       { name: 'Mahayana', subcastes: ['Tibetan', 'Zen'] },
//     ],
//   },
// ];

// async function seed() {
//   try {
//     await connectDB();
//     await syncModels(false); // Don't force drop

//     console.log('🌱 Seeding database...');

//     for (const rData of seedData) {
//       const [religion] = await Religion.findOrCreate({
//         where: { name: rData.name },
//         defaults: { name: rData.name },
//       });

//       for (const cData of rData.castes) {
//         const [caste] = await Caste.findOrCreate({
//           where: { name: cData.name, religion_id: religion.id },
//           defaults: { name: cData.name, religion_id: religion.id },
//         });

//         for (const scName of cData.subcastes) {
//           await SubCaste.findOrCreate({
//             where: { name: scName, caste_id: caste.id },
//             defaults: { name: scName, caste_id: caste.id },
//           });
//         }
//       }

//       console.log(`  ✅ Seeded: ${rData.name} (${rData.castes.length} castes)`);
//     }

//     console.log('\n✅ Seeding complete!');
//     process.exit(0);
//   } catch (error) {
//     console.error('❌ Seeding failed:', error);
//     process.exit(1);
//   }
// }

// seed();

import { connectDB } from '../lib/db';
import { Religion, Caste, SubCaste, syncModels } from '../models';

const seedData = [
  {
    name: 'Hindu',
    castes: [
      { name: 'Brahmin', subcastes: ['Iyer', 'Iyengar', 'Namboothiri', 'Saraswat'] },
      { name: 'Kshatriya', subcastes: ['Rajput', 'Maratha', 'Nair'] },
      { name: 'Vaishya', subcastes: ['Agarwal', 'Marwari', 'Baniya'] },
    ],
  },
  {
    name: 'Muslim',
    castes: [
      { name: 'Sunni', subcastes: ['Hanafi', 'Shafi', 'Maliki'] },
      { name: 'Shia', subcastes: ['Ithna Ashari', 'Ismaili'] },
    ],
  },
];

async function seed() {
  try {
    // ✅ FIX 1: correct DB connection
    await connectDB();

    await syncModels(false);

    console.log('🌱 Seeding database...');

    for (const rData of seedData) {
      const [religion]: any = await Religion.findOrCreate({
        where: { name: rData.name },
        defaults: { name: rData.name },
      });

      for (const cData of rData.castes) {
        const [caste]: any = await Caste.findOrCreate({
          where: {
            name: cData.name,
            religion_id: religion.id,
          },
          defaults: {
            name: cData.name,
            religion_id: religion.id,
          },
        });

        for (const scName of cData.subcastes) {
          await SubCaste.findOrCreate({
            where: {
              name: scName,
              caste_id: caste.id,
            },
            defaults: {
              name: scName,
              caste_id: caste.id,
            },
          });
        }
      }

      console.log(`✅ Seeded: ${rData.name}`);
    }

    console.log('🎉 Seeding completed successfully!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seeding failed:', err);
    process.exit(1);
  }
}

seed();