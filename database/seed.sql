USE tours_travels_db;

INSERT INTO destinations (name, description, location, image_url)
SELECT 'Bali', 'Tropical beaches, rice terraces, and welcoming local culture.', 'Bali, Indonesia',
       'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=1200&q=80'
WHERE NOT EXISTS (SELECT 1 FROM destinations WHERE name = 'Bali');

INSERT INTO destinations (name, description, location, image_url)
SELECT 'Kyoto', 'Historic temples, quiet gardens, and traditional streets.', 'Kyoto, Japan',
       'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1200&q=80'
WHERE NOT EXISTS (SELECT 1 FROM destinations WHERE name = 'Kyoto');

INSERT INTO destinations (name, description, location, image_url)
SELECT 'Swiss Alps', 'Alpine villages, mountain trails, and unforgettable views.', 'Switzerland',
       'https://images.unsplash.com/photo-1531366936337-7c912a4589a7?auto=format&fit=crop&w=1200&q=80'
WHERE NOT EXISTS (SELECT 1 FROM destinations WHERE name = 'Swiss Alps');

INSERT INTO destinations (name, description, location, image_url)
SELECT 'Marrakech', 'Colorful souks, historic palaces, and desert landscapes.', 'Marrakech, Morocco',
       'https://images.unsplash.com/photo-1539020140153-e479b8c22e70?auto=format&fit=crop&w=1200&q=80'
WHERE NOT EXISTS (SELECT 1 FROM destinations WHERE name = 'Marrakech');

INSERT INTO travel_packages (name, destination_id, description, duration, price, availability)
SELECT 'Bali Island Discovery', d.id, 'Explore Ubud, visit local temples, and unwind by the coast.',
       '6 days / 5 nights', 1240.00, 12
FROM destinations d
WHERE d.name = 'Bali'
  AND NOT EXISTS (SELECT 1 FROM travel_packages WHERE name = 'Bali Island Discovery');

INSERT INTO travel_packages (name, destination_id, description, duration, price, availability)
SELECT 'Kyoto Culture Walk', d.id, 'Discover historic shrines, gardens, and neighborhood cuisine.',
       '5 days / 4 nights', 980.00, 10
FROM destinations d
WHERE d.name = 'Kyoto'
  AND NOT EXISTS (SELECT 1 FROM travel_packages WHERE name = 'Kyoto Culture Walk');

INSERT INTO travel_packages (name, destination_id, description, duration, price, availability)
SELECT 'Alpine Lakes Escape', d.id, 'Ride mountain railways and explore beautiful lakeside villages.',
       '7 days / 6 nights', 1850.00, 8
FROM destinations d
WHERE d.name = 'Swiss Alps'
  AND NOT EXISTS (SELECT 1 FROM travel_packages WHERE name = 'Alpine Lakes Escape');

INSERT INTO travel_packages (name, destination_id, description, duration, price, availability)
SELECT 'Marrakech and Atlas', d.id, 'Experience the medina and take a guided trip into the Atlas foothills.',
       '4 days / 3 nights', 760.00, 14
FROM destinations d
WHERE d.name = 'Marrakech'
  AND NOT EXISTS (SELECT 1 FROM travel_packages WHERE name = 'Marrakech and Atlas');
