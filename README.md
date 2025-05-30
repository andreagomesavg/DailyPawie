#DailyPawie 🐾
A comprehensive pet care management platform designed to help pet parents organize, track, and manage their furry friends' health and daily care needs.
📋 Overview
DailyPawie is a digital platform that serves as a centralized hub for pet care management. Born from the growing concern of pet owners about providing the best quality of life for their companions, this tool helps solve common challenges faced by pet parents in managing their pets' health records, daily care routines, and medical appointments.
The platform recognizes that pets have become fundamental family members, positively influencing both emotional and psychological well-being of households, especially in Spain where pet adoption continues to rise.
✨ Features
🏠 Home Dashboard

Pet Cards: Quick overview of all registered pets
Smart Reminders: Upcoming grooming appointments, medication schedules, and vet visits
Personalized Recommendations: Species-specific care tips and breed information
Photo Gallery: Display your pets' favorite moments

🐕 Pet Profiles
Comprehensive pet information management including:

Basic Information: Photo, name, species (dogs & cats), breed, gender, age, birth date
Physical Details: Size, weight tracking
Ownership: Owner and caregiver information

🏥 Medical History
Complete veterinary record keeping:

Vaccinations: Type, administration date, next dose due, batch numbers
Deworming: Internal and external treatments with scheduling
Veterinary Consultations: Visit dates, reasons, diagnoses, recommended treatments
Surgical Procedures: Surgery type, date, complications, post-operative care
Allergies: Food and medication reaction tracking
Laboratory Tests: Blood work, urine tests, X-rays, ultrasounds
Medical Treatments: Medications (name, dosage, duration), additional therapies
Progress Tracking: Health evolution notes and treatment updates

📅 Care Management
Daily care routine organization:

Feeding Schedule: Appropriate nutrition and fresh water access
Hygiene Care: Grooming, dental care, bathing, ear and eye cleaning
Exercise Tracking: Daily walks, active play, indoor activities
Attention & Affection: Quality time and mental stimulation
Safe Environment: Clean living space and hazard monitoring
Training & Socialization: Behavior reinforcement and social development

🔔 Smart Reminders

Veterinary appointment notifications
Medication time alerts
Grooming schedule reminders
Exercise and feeding time notifications

🛠️ Tech Stack

Frontend: Next.js with Tailwind CSS 4
Backend: Supabase + Payload CMS
Database: PostgreSQL (via Supabase)
Authentication: Supabase Auth
External APIs: Dog breed information and pet facts

🎯 Target Audience
DailyPawie is designed for Spanish pet parents who:

Average age of 44 years
Are parents with children
Own multiple pets (average 2+ animals)
Have stable income but limited time for pet record organization
Need centralized pet care management
Want to ensure proper care scheduling and medical record keeping

🚀 Getting Started
Prerequisites

Node.js (v18 or higher)
npm or yarn
Supabase account

Installation

Clone the repository
bashgit clone https://github.com/yourusername/dailypawie.git
cd dailypawie

Install dependencies
bashnpm install
# or
yarn install

Environment Setup
Create a .env.local file in the root directory:
envNEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

Database Setup
Run the Supabase migrations:
bashnpx supabase db reset

Start the development server
bashnpm run dev
# or
yarn dev

Open your browser
Navigate to http://localhost:3000

📱 Usage

Create Account: Sign up with your email and password
Add Pets: Register your pets with their basic information
Medical Records: Input existing veterinary records and vaccination history
Set Reminders: Configure care schedules and appointment notifications
Daily Management: Track daily care activities and update as needed
Monitor Health: Keep medical records updated and track your pet's health evolution

🔮 Future Features (Planned)

QR Code Integration: Quick access to pet medical records via QR codes
Caregiver System: Temporary care delegation for travel or emergencies
Veterinary Telemedicine: Online consultations with certified veterinarians
Wearable Device Integration: Activity and health monitoring
Community Features: Forums and local pet parent connections
Marketplace: Pet products and services integration
Insurance Integration: Pet health insurance management

🤝 Contributing
We welcome contributions to DailyPawie! Please follow these steps:

Fork the repository
Create a feature branch (git checkout -b feature/amazing-feature)
Commit your changes (git commit -m 'Add some amazing feature')
Push to the branch (git push origin feature/amazing-feature)
Open a Pull Request

Development Guidelines

Follow the existing code style and formatting
Write clear, descriptive commit messages
Add appropriate tests for new features
Update documentation as needed
Ensure responsive design for mobile devices

📄 License
This project is licensed under the MIT License - see the LICENSE file for details.
🙏 Acknowledgments

ANFAAC Spain - Pet ownership statistics
Veterindustria - Industry insights
Dog API - Breed information data
The growing community of responsible pet parents in Spain

📞 Support
If you encounter any issues or have questions:

Check the Issues page
Create a new issue with detailed description
Contact the development team

📊 Market Context
DailyPawie addresses the growing pet care market in Spain, where:

Nearly 6 pets exist for every child under 4 years old
Dogs represent 30% of pets, cats 18%
39% of pet owners consider themselves "pet parents"
Rising awareness of animal rights and welfare


Made with ❤️ for pet parents everywhere
