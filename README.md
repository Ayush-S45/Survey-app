# Employee Feedback System

A comprehensive MERN stack application for managing employee feedback and surveys. This system allows employees to submit feedback about projects, managers, work environment, and more, while providing HR and managers with powerful analytics and management tools.

## Features

### For Employees
- Submit feedback on various topics (projects, managers, workplace, etc.)
- Participate in surveys with different question types
- View personal feedback history
- Anonymous feedback options
- User-friendly interface

### For Managers
- Create and manage surveys
- View team feedback and analytics
- Export survey responses
- Manage department-specific surveys

### For HR & Admin
- Complete user management
- Department management
- Survey creation and management
- Advanced analytics and reporting
- CSV export functionality
- Role-based access control

## Tech Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM for MongoDB
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **express-validator** - Input validation

### Frontend
- **React** - UI library
- **React Router** - Client-side routing
- **Axios** - HTTP client
- **Tailwind CSS** - Styling
- **Recharts** - Data visualization
- **React Hook Form** - Form management
- **React Hot Toast** - Notifications

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or cloud)
- npm or yarn

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd survey
   ```

2. **Install all dependencies (backend, frontend, and root)**
   ```bash
   npm run install-all
   ```

3. **Environment Setup**
   ```bash
   cp backend/env.example backend/.env
   ```
   
   Edit `backend/.env` file with your configuration:
   ```env
   PORT=5000
   NODE_ENV=development
   MONGODB_URI=mongodb://localhost:27017/feedback-system
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   ```

4. **Start MongoDB**
   - Local: Make sure MongoDB is running on your system
   - Cloud: Use MongoDB Atlas or similar service

## Running the Application

### Development Mode

**Option 1: Run both backend and frontend together**
```bash
npm run dev
```

**Option 2: Run separately**
```bash
# Terminal 1 - Backend
npm run backend

# Terminal 2 - Frontend
npm run frontend
```

### Production Mode

1. **Build the frontend**
   ```bash
   npm run build
   ```

2. **Start the production server**
   ```bash
   npm start
   ```

## Project Structure

```
survey/
├── package.json              # Root package.json for managing both apps
├── README.md                 # Project documentation
├── backend/                  # Backend application
│   ├── server.js            # Main server file
│   ├── package.json         # Backend dependencies
│   ├── .env                 # Environment variables
│   ├── models/              # MongoDB schemas
│   │   ├── User.js
│   │   ├── Survey.js
│   │   ├── Feedback.js
│   │   └── Department.js
│   ├── routes/              # API endpoints
│   │   ├── auth.js
│   │   ├── surveys.js
│   │   ├── feedback.js
│   │   ├── users.js
│   │   └── departments.js
│   └── middleware/          # Authentication middleware
│       └── auth.js
└── frontend/                # Frontend application
    └── client/              # React application
        ├── package.json     # Frontend dependencies
        ├── public/          # Static files
        └── src/             # React source code
            ├── components/  # React components
            ├── contexts/    # React contexts
            └── App.js       # Main App component
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `POST /api/auth/change-password` - Change password

### Surveys
- `GET /api/surveys` - Get all surveys
- `GET /api/surveys/:id` - Get survey by ID
- `POST /api/surveys` - Create new survey
- `PUT /api/surveys/:id` - Update survey
- `DELETE /api/surveys/:id` - Delete survey
- `GET /api/surveys/:id/responses` - Get survey responses

### Feedback
- `POST /api/feedback` - Submit feedback
- `GET /api/feedback/my-responses` - Get user's responses
- `GET /api/feedback/analytics` - Get analytics
- `GET /api/feedback/export/:surveyId` - Export responses

### Users
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user by ID
- `POST /api/users` - Create user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Deactivate user

### Departments
- `GET /api/departments` - Get all departments
- `GET /api/departments/:id` - Get department by ID
- `POST /api/departments` - Create department
- `PUT /api/departments/:id` - Update department
- `DELETE /api/departments/:id` - Deactivate department

## User Roles

### Employee
- Submit feedback and surveys
- View personal history
- Basic profile management

### Manager
- Create surveys for their department
- View team analytics
- Manage department surveys

### HR
- Full user management
- Department management
- Advanced analytics
- Survey management

### Admin
- Complete system access
- All HR capabilities
- System configuration

## Survey Types

- **Text** - Open-ended responses
- **Rating** - Numeric ratings
- **Multiple Choice** - Single selection
- **Checkbox** - Multiple selections
- **Scale** - Likert scale questions

## Survey Categories

- **Project** - Project-specific feedback
- **Manager** - Manager evaluation
- **Workplace** - Work environment feedback
- **General** - General feedback
- **Custom** - Custom categories

## Database Schema

### User Model
- Personal information (name, email, employee ID)
- Role and permissions
- Department assignment
- Manager relationship

### Survey Model
- Survey metadata (title, description, category)
- Questions array with different types
- Target audience configuration
- Date ranges and settings

### Feedback Model
- Survey responses
- Respondent information
- Metadata and analytics
- Anonymous options

### Department Model
- Department information
- Head assignment
- Employee relationships

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions, please open an issue in the repository.

## Deployment

### Heroku
1. Create a Heroku app
2. Set environment variables
3. Deploy using Heroku CLI or GitHub integration

### Vercel/Netlify (Frontend)
1. Connect your repository
2. Set build command: `npm run build`
3. Set output directory: `frontend/client/build`

### Railway/Render (Backend)
1. Connect your repository
2. Set environment variables
3. Deploy automatically

## Security Features

- JWT authentication
- Password hashing with bcrypt
- Input validation
- Rate limiting
- CORS protection
- Helmet security headers
- Role-based access control 