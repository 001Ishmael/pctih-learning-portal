-- Sample seed data for People's Choice Learning Portal

insert into courses (title, slug, description, is_free, price, duration, venue, capacity, status) values
('Digital Literacy', 'digital-literacy', 'Foundational computer and internet skills for beginners.', true, 0, '4 weeks', 'PCTIH Main Hall', 30, 'published'),
('Microsoft Office', 'microsoft-office', 'Word, Excel, PowerPoint mastery for office productivity.', false, 350000, '6 weeks', 'PCTIH Lab 1', 25, 'published'),
('Graphics Design', 'graphics-design', 'Learn Photoshop, Illustrator and Canva for professional design.', false, 500000, '8 weeks', 'PCTIH Lab 2', 20, 'published'),
('Web Development', 'web-development', 'HTML, CSS, JavaScript and React to build modern websites.', false, 800000, '12 weeks', 'PCTIH Lab 1', 20, 'published'),
('Python Programming', 'python-programming', 'Programming fundamentals using Python.', false, 600000, '10 weeks', 'PCTIH Lab 2', 20, 'published'),
('Data Analysis', 'data-analysis', 'Excel, SQL and visualization for data-driven decisions.', false, 650000, '8 weeks', 'PCTIH Lab 1', 20, 'published'),
('AI Fundamentals', 'ai-fundamentals', 'Introduction to artificial intelligence and machine learning.', false, 700000, '6 weeks', 'PCTIH Lab 2', 20, 'published'),
('Cybersecurity Basics', 'cybersecurity-basics', 'Essential security practices for individuals and businesses.', false, 550000, '6 weeks', 'PCTIH Lab 1', 20, 'published'),
('STEM for Kids', 'stem-for-kids', 'Fun introduction to science, tech, engineering and math for children.', true, 0, '4 weeks', 'PCTIH Main Hall', 30, 'published');

insert into workshops (title, slug, type, description, date, time, venue, is_free, price, capacity, registration_deadline, status) values
('Career Readiness Workshop', 'career-readiness-workshop', 'workshop', 'Resume writing, interview skills and job search strategy.', current_date + interval '14 days', '10:00 AM', 'PCTIH Main Hall', true, 0, 50, current_date + interval '10 days', 'upcoming'),
('AI for Beginners Seminar', 'ai-for-beginners-seminar', 'seminar', 'A friendly introduction to AI tools and concepts.', current_date + interval '21 days', '2:00 PM', 'PCTIH Main Hall', false, 100000, 60, current_date + interval '18 days', 'upcoming'),
('Digital Entrepreneurship Bootcamp', 'digital-entrepreneurship-bootcamp', 'bootcamp', 'Build and launch an online business in 3 days.', current_date + interval '30 days', '9:00 AM', 'PCTIH Lab 1', false, 250000, 30, current_date + interval '25 days', 'upcoming'),
('Website Building Masterclass', 'website-building-masterclass', 'short_training', 'Build your first website in one afternoon.', current_date + interval '10 days', '1:00 PM', 'PCTIH Lab 2', false, 150000, 25, current_date + interval '7 days', 'upcoming'),
('Social Media Marketing Workshop', 'social-media-marketing-workshop', 'workshop', 'Grow your brand using Facebook, Instagram and TikTok.', current_date + interval '17 days', '11:00 AM', 'PCTIH Main Hall', false, 120000, 50, current_date + interval '14 days', 'upcoming');

insert into settings (key, value) values
('orange_money_number', '"+232 79 468 780"'),
('org_name', '"People''s Choice Technology & Innovation Hub"'),
('org_address', '"4 Andrew Street, Off Krootown Road, Freetown, Sierra Leone"'),
('org_email', '"peopleschoicet@gmail.com"'),
('org_phone', '"+232 79 468 780"');
