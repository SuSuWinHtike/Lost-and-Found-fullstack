<?php

namespace Database\Seeders;

use App\Models\Breed;
use App\Models\CityTownship;
use App\Models\Color;
use App\Models\Conversation;
use App\Models\Message;
use App\Models\PetCategory;
use App\Models\PetImage;
use App\Models\PetMatch;
use App\Models\PetReport;
use App\Models\Sighting;
use App\Models\SightingImage;
use App\Models\StateRegion;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // 1. States & Regions
        $regions = [
            'Yangon Region' => ['Hlaing Township', 'Kamayut Township', 'Bahan Township', 'Mayangone Township', 'Sanchaung Township', 'Dagon Township', 'Yankin Township', 'Insein Township', 'Tamwe Township', 'South Okkalapa', 'North Okkalapa', 'Kyauktada Township'],
            'Mandalay Region' => ['Chanayethazan', 'Maha Aungmye', 'Pyigyidagun', 'Amarapura', 'Aungmyethazan', 'Chanmyathazi'],
            'Shan State' => ['Taunggyi', 'Kalaw', 'Aungban', 'Nyaungshwe', 'Lashio'],
            'Bago Region' => ['Bago', 'Pyay', 'Taungoo'],
            'Ayeyarwady Region' => ['Pathein', 'Hinthada', 'Myaungmya'],
            'Naypyidaw Union Territory' => ['Zabuthiri', 'Ottarathiri', 'Dekkhinathiri', 'Pobbathiri'],
            'Magway Region' => ['Magway', 'Pakokku', 'Minbu'],
            'Sagaing Region' => ['Sagaing', 'Monywa', 'Shwebo'],
            'Mon State' => ['Mawlamyine', 'Mudon', 'Thaton'],
            'Kayin State' => ['Hpa-An', 'Myawaddy'],
            'Kachin State' => ['Myitkyina', 'Bhamo'],
            'Rakhine State' => ['Sittwe', 'Thandwe'],
        ];

        $regionModels = [];
        $townshipModels = [];

        foreach ($regions as $regionName => $townships) {
            $region = StateRegion::create(['name' => $regionName]);
            $regionModels[$regionName] = $region;

            foreach ($townships as $townshipName) {
                $t = CityTownship::create([
                    'state_region_id' => $region->id,
                    'name' => $townshipName,
                ]);
                $townshipModels[$regionName . '|' . $townshipName] = $t;
            }
        }

        // 2. Categories
        $dogCat = PetCategory::create(['name' => 'Dog', 'slug' => 'dog', 'icon' => 'dog']);
        $catCat = PetCategory::create(['name' => 'Cat', 'slug' => 'cat', 'icon' => 'cat']);

        // 3. Breeds
        $dogBreeds = ['Golden Retriever', 'German Shepherd', 'Siberian Husky', 'Poodle', 'Pug', 'Beagle', 'Chow Chow', 'Labrador Retriever', 'Mixed Breed'];
        $breedModels = [];
        foreach ($dogBreeds as $b) {
            $breedModels['Dog|' . $b] = Breed::create([
                'category_id' => $dogCat->id,
                'name' => $b,
                'slug' => strtolower(str_replace(' ', '-', $b)),
            ]);
        }

        $catBreeds = ['Persian', 'British Shorthair', 'Siamese', 'Maine Coon', 'Bengal', 'Scottish Fold', 'Domestic Shorthair'];
        foreach ($catBreeds as $b) {
            $breedModels['Cat|' . $b] = Breed::create([
                'category_id' => $catCat->id,
                'name' => $b,
                'slug' => strtolower(str_replace(' ', '-', $b)),
            ]);
        }

        // 4. Colors
        $colorNames = ['Golden / Cream', 'Black & Tan', 'White & Grey', 'Orange & White', 'Cream', 'White', 'Black', 'Brown', 'Grey', 'Tricolor', 'Ginger / Red'];
        $colorModels = [];
        foreach ($colorNames as $c) {
            $colorModels[$c] = Color::create(['name' => $c]);
        }

        // 5. Users
        $user1 = User::create([
            'name' => 'Kyaw Zin Htet',
            'email' => 'kyawzin@gmail.com',
            'phone' => '09-450-123-789',
            'password' => Hash::make('password123'),
            'role' => 'user',
            'status' => 'active',
            'state_region' => 'Yangon Region',
            'township' => 'Hlaing Township',
            'avatar' => 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
        ]);

        $user2 = User::create([
            'name' => 'Ma Sandar',
            'email' => 'sandar@gmail.com',
            'phone' => '09-798-654-321',
            'password' => Hash::make('password123'),
            'role' => 'user',
            'status' => 'active',
            'state_region' => 'Yangon Region',
            'township' => 'Kamayut Township',
            'avatar' => 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80',
        ]);

        $admin = User::create([
            'name' => 'System Administrator',
            'email' => 'admin@petlove.org',
            'phone' => '09-977-888-999',
            'password' => Hash::make('admin123'),
            'role' => 'admin',
            'status' => 'active',
            'state_region' => 'Yangon Region',
            'township' => 'Bahan Township',
            'avatar' => 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=200&q=80',
        ]);

        // 6. Pet Reports & Images
        $p1 = PetReport::create([
            'user_id' => $user1->id,
            'category_id' => $dogCat->id,
            'breed_id' => $breedModels['Dog|Golden Retriever']->id,
            'color_id' => $colorModels['Golden / Cream']->id,
            'secondary_color' => 'White chest',
            'type' => 'lost',
            'pet_name' => 'Milo',
            'age' => '2.5 years',
            'gender' => 'male',
            'collar_description' => 'Red collar with bell',
            'microchip_id' => 'MC-984210',
            'event_date' => '2026-10-28',
            'event_time' => '16:30',
            'state_region_id' => $regionModels['Yangon Region']->id,
            'township_id' => $townshipModels['Yangon Region|Hlaing Township']->id,
            'last_seen_or_found_location' => 'Near Parami Road Junction',
            'description' => 'Friendly male golden retriever wearing a red collar with a silver bell. Very approachable and answers to his name. Microchipped.',
            'reward_amount' => '150,000 MMK',
            'contact_name' => 'Kyaw Zin Htet',
            'contact_phone' => '09-450-123-789',
            'status' => 'approved',
            'is_featured' => true,
        ]);
        PetImage::create(['pet_report_id' => $p1->id, 'image_path' => 'https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=800&q=80', 'is_primary' => true]);

        $p2 = PetReport::create([
            'user_id' => $user2->id,
            'category_id' => $catCat->id,
            'breed_id' => $breedModels['Cat|Persian']->id,
            'color_id' => $colorModels['White']->id,
            'type' => 'found',
            'pet_name' => 'Found White Cat',
            'age' => 'Approx 1 year',
            'gender' => 'female',
            'collar_description' => 'No collar',
            'event_date' => '2026-10-29',
            'event_time' => '09:00',
            'state_region_id' => $regionModels['Yangon Region']->id,
            'township_id' => $townshipModels['Yangon Region|Kamayut Township']->id,
            'last_seen_or_found_location' => 'Near Inya Lake jogging trail',
            'description' => 'Very calm white fluffy Persian cat found sheltering under a cafe umbrella. Well-groomed and appears to be an indoor house cat.',
            'physical_condition' => 'Healthy, well groomed',
            'safe_holding_location' => 'Fostered safely at home in Kamayut',
            'contact_name' => 'Ma Sandar',
            'contact_phone' => '09-798-654-321',
            'status' => 'approved',
            'is_featured' => true,
        ]);
        PetImage::create(['pet_report_id' => $p2->id, 'image_path' => 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=800&q=80', 'is_primary' => true]);

        $p3 = PetReport::create([
            'user_id' => $user1->id,
            'category_id' => $dogCat->id,
            'breed_id' => $breedModels['Dog|German Shepherd']->id,
            'color_id' => $colorModels['Black & Tan']->id,
            'type' => 'lost',
            'pet_name' => 'Max',
            'age' => '3 years',
            'gender' => 'male',
            'collar_description' => 'Black leather collar',
            'microchip_id' => 'MC-771239',
            'event_date' => '2026-10-27',
            'event_time' => '19:00',
            'state_region_id' => $regionModels['Mandalay Region']->id,
            'township_id' => $townshipModels['Mandalay Region|Chanayethazan']->id,
            'last_seen_or_found_location' => '78th Street, near Diamond Plaza',
            'description' => 'Tall German Shepherd with distinct black saddle marking. Alert ears and active temperament. Has a noticeable slight scar above left brow.',
            'reward_amount' => '200,000 MMK',
            'contact_name' => 'Ko Thein',
            'contact_phone' => '09-250-987-654',
            'status' => 'approved',
            'is_featured' => true,
        ]);
        PetImage::create(['pet_report_id' => $p3->id, 'image_path' => 'https://images.unsplash.com/photo-1589941013453-ec89f33b5455?auto=format&fit=crop&w=800&q=80', 'is_primary' => true]);

        $p4 = PetReport::create([
            'user_id' => $user2->id,
            'category_id' => $dogCat->id,
            'breed_id' => $breedModels['Dog|Golden Retriever']->id,
            'color_id' => $colorModels['Golden / Cream']->id,
            'type' => 'found',
            'pet_name' => 'Rescued Golden Pup',
            'age' => 'Approx 2 years',
            'gender' => 'male',
            'collar_description' => 'Red collar without tag',
            'event_date' => '2026-10-29',
            'event_time' => '17:30',
            'state_region_id' => $regionModels['Yangon Region']->id,
            'township_id' => $townshipModels['Yangon Region|Mayangone Township']->id,
            'last_seen_or_found_location' => '8 Mile Junction near City Mart',
            'description' => 'Found an energetic golden retriever roaming near convenience store. Red collar matches lost description. Kept safely in clinic yard.',
            'physical_condition' => 'Active, slightly thirsty',
            'safe_holding_location' => 'Local Vet Clinic 8 Mile',
            'contact_name' => 'Dr. Aung',
            'contact_phone' => '09-880-555-111',
            'status' => 'approved',
            'is_featured' => true,
        ]);
        PetImage::create(['pet_report_id' => $p4->id, 'image_path' => 'https://images.unsplash.com/photo-1633722715463-d30f4f325e24?auto=format&fit=crop&w=800&q=80', 'is_primary' => true]);

        // 7. Initial Sightings
        Sighting::create([
            'pet_report_id' => $p1->id,
            'user_id' => $user2->id,
            'state_region_id' => $regionModels['Yangon Region']->id,
            'township_id' => $townshipModels['Yangon Region|Kamayut Township']->id,
            'sighting_date' => '2026-10-29',
            'sighting_time' => '08:15 AM',
            'location_details' => 'Spotted roaming near Inya Lake jogging trail heading north.',
            'witness_notes' => 'Looked in good shape, wagging tail, was wearing a reddish collar.',
            'status' => 'approved',
        ]);

        // 8. Initial Match
        PetMatch::create([
            'lost_report_id' => $p1->id,
            'found_report_id' => $p4->id,
            'confidence_score' => 95.0,
            'matching_attributes' => ['species', 'breed', 'color', 'gender', 'collar', 'township'],
            'status' => 'suggested',
        ]);

    }
}
