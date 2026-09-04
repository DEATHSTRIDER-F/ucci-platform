-- Migration for existing DB: add chapter descriptions from Form 1
ALTER TABLE chapters ADD COLUMN IF NOT EXISTS description TEXT;

UPDATE chapters SET description = 'Includes localities within Kharadi, Wadgaosheri, Mundhwa, Hadapsar' WHERE slug = 'east' AND area_id = (SELECT id FROM areas WHERE slug = 'pune');
UPDATE chapters SET description = 'Includes localities within Kothrud, Aundh, Baner, Pashan, Bavdhan, Warje' WHERE slug = 'west' AND area_id = (SELECT id FROM areas WHERE slug = 'pune');
UPDATE chapters SET description = 'Includes localities within Viman Nagar, Lohegaon, Dhanori, Vishrantwadi, Wagholi' WHERE slug = 'north' AND area_id = (SELECT id FROM areas WHERE slug = 'pune');
UPDATE chapters SET description = 'Includes localities within Kondhwa, Mohammadwadi, Undri, Pisoli, Wanwadi, Katraj, Bibvewadi, Handewadi' WHERE slug = 'south' AND area_id = (SELECT id FROM areas WHERE slug = 'pune');
UPDATE chapters SET description = 'Includes localities within Peth areas, Camp, Swargate, Koregaon Park, Ghorpadi' WHERE slug = 'central' AND area_id = (SELECT id FROM areas WHERE slug = 'pune');
UPDATE chapters SET description = 'Includes localities within Chikali, Bhosari, Alandi, Moshi' WHERE slug = 'east' AND area_id = (SELECT id FROM areas WHERE slug = 'pcmc');
UPDATE chapters SET description = 'Includes localities within Wakad, Hinjewadi, Ravet, Nigdi, Dehu Road' WHERE slug = 'west' AND area_id = (SELECT id FROM areas WHERE slug = 'pcmc');
