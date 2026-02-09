-- 1. Insert Demo Assessments
INSERT INTO assessments (title, problem_image_url, prompt_text, required_keywords)
VALUES 
(
  'Electrical: Panel Inspection', 
  'https://images.unsplash.com/photo-1621905252507-b354bcadc0e2?q=80&w=1000', 
  'Look at Breaker #14. Identify the safety hazard and explain how to fix it according to NEC code.',
  ARRAY['double tap', 'pigtail', 'breaker']
),
(
  'Plumbing: Water Heater Service', 
  'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?q=80&w=1000', 
  'The T&P valve on this unit is capped. Explain the immediate danger and your repair plan.',
  ARRAY['pressure', 'relief valve', 'copper', 'discharge']
),
(
  'Homeowner Protocol: Pet Safety', 
  'https://images.unsplash.com/photo-1541364983171-a8ba01e95cfc?q=80&w=1000', 
  'You arrive at a job and the owner has two large dogs (like Bailey and Jake) behind a gate. What is your entry protocol?',
  ARRAY['owner present', 'secure', 'service animal']
);