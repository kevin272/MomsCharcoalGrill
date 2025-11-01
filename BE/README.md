# Backend API Server

A comprehensive Node.js backend API built with Express.js, MongoDB, and Mongoose for serving dynamic content to frontend applications.

## Features

- **RESTful API** with Express.js
- **MongoDB** integration with Mongoose ODM
- **File upload** handling with Multer + Cloudinary
- **CORS** support for frontend integration
- **Environment configuration** with dotenv
- **Comprehensive error handling**
- **Consistent API responses**
- **Static file serving**

## Tech Stack

- Node.js
- Express.js
- MongoDB
- Mongoose
- Multer (multipart parsing)
- Cloudinary (asset storage)
- CORS
- dotenv

## API Endpoints

### Services
- `GET /api/services` - Get all services
- `GET /api/services/:id` - Get service by ID
- `POST /api/services` - Create service (admin)
- `PUT /api/services/:id` - Update service (admin)
- `DELETE /api/services/:id` - Delete service (admin)

### Projects
- `GET /api/projects` - Get all projects
- `GET /api/projects/:id` - Get project by ID
- `GET /api/projects/featured/list` - Get featured projects
- `POST /api/projects` - Create project (admin)
- `PUT /api/projects/:id` - Update project (admin)
- `DELETE /api/projects/:id` - Delete project (admin)

### Team
- `GET /api/team` - Get all team members
- `GET /api/team/:id` - Get team member by ID
- `GET /api/team/department/:dept` - Get team by department
- `POST /api/team` - Create team member (admin)
- `PUT /api/team/:id` - Update team member (admin)
- `DELETE /api/team/:id` - Delete team member (admin)

### Gallery
- `GET /api/gallery` - Get all gallery items
- `GET /api/gallery/:id` - Get gallery item by ID
- `GET /api/gallery/category/:category` - Get gallery by category
- `POST /api/gallery` - Upload gallery item (admin)
- `PUT /api/gallery/:id` - Update gallery item (admin)
- `DELETE /api/gallery/:id` - Delete gallery item (admin)

### Careers
- `GET /api/careers` - Get all career openings
- `GET /api/careers/:id` - Get career opening by ID
- `GET /api/careers/active/list` - Get active openings
- `GET /api/careers/department/:dept` - Get careers by department
- `POST /api/careers` - Create career opening (admin)
- `PUT /api/careers/:id` - Update career opening (admin)
- `DELETE /api/careers/:id` - Delete career opening (admin)

### Contact
- `POST /api/contact` - Submit contact form
- `GET /api/contact` - Get all messages (admin)
- `GET /api/contact/:id` - Get message by ID (admin)
- `PATCH /api/contact/:id/status` - Update message status (admin)
- `GET /api/contact/stats/summary` - Get message statistics (admin)
- `DELETE /api/contact/:id` - Delete message (admin)

### Additional Endpoints
- `GET /api/stats` - Get company statistics
- `GET /api/about` - Get company information
- `GET /api/process` - Get process steps
- `GET /api/health` - Health check endpoint

## Installation

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your configuration
```

3. Start the server:
```bash
# Development mode with auto-restart
npm run dev

# Production mode
npm start
```

## Environment Variables

```env
MONGODB_URI=mongodb://localhost:27017/company_portfolio
PORT=5000
NODE_ENV=development
MAX_FILE_SIZE=5242880
ALLOWED_FILE_TYPES=image/jpeg,image/jpg,image/png,image/gif,image/webp
# Either provide the individual credentials _or_ a single CLOUDINARY_URL
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
# CLOUDINARY_URL=cloudinary://key:secret@your-cloud-name
# Optional customisations
CLOUDINARY_UPLOAD_FOLDER=uploads
CLOUDINARY_UPLOAD_PRESET=
```

## File Uploads

- Images are uploaded directly to Cloudinary using secure URLs
- Supported formats: JPEG, JPG, PNG, GIF, WebP (configurable via `ALLOWED_FILE_TYPES`)
- Maximum file size: 5MB by default (configurable via `MAX_FILE_SIZE`)
- Uploaded files are grouped into folders based on the API route (e.g. `uploads/menu`, `uploads/gallery`)
- You can configure Cloudinary with individual credentials or a single `CLOUDINARY_URL` connection string
- Existing assets previously stored under `/uploads` remain accessible via Express static serving for backwards compatibility

### Migrating existing local uploads

If you previously stored images on disk in `BE/uploads`, run the migration script after
configuring your Cloudinary and MongoDB credentials:

```bash
cd BE
# ensure dependencies are installed and environment variables are set
npm run migrate:uploads
```

The script uploads every referenced file to Cloudinary and updates database records to use the
new secure URLs. Missing files are skipped with a warning so you can re-upload them manually.


## Database Models

### Service
- Title, description, sections
- Pricing information
- Active status and ordering

### Project
- Title, description, images
- Technologies used
- Client information
- Team assignments
- Project status and links

### TeamMember
- Personal information
- Skills and experience
- Social media links
- Department assignments

### Gallery
- Image with title and description
- Categorization and tagging
- Public/private visibility

### Career
- Job title and description
- Requirements and responsibilities
- Salary and benefits information
- Application deadline

### ContactMessage
- Contact form submissions
- Message categorization
- Status tracking
- Response management

## API Response Format

### Success Response
```json
{
  "success": true,
  "message": "Data retrieved successfully",
  "data": [...],
  "count": 10,
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### Error Response
```json
{
  "success": false,
  "error": "Error message",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

## Frontend Integration

The frontend can fetch data from the API:

```javascript
// Example: Fetch services
const response = await fetch('http://localhost:5000/api/services');
const { data: services } = await response.json();

// Example: Submit contact form
const response = await fetch('http://localhost:5000/api/contact', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(formData)
});
```

## Development

- The server runs on port 5000 by default
- Use `npm run dev` for development with auto-restart
- MongoDB must be running locally or provide a connection string
- CORS is configured to allow requests from common frontend dev servers

## Production Deployment

1. Set `NODE_ENV=production`
2. Use a proper MongoDB instance (not local)
3. Configure proper CORS origins
4. Set up proper file upload limits and security
5. Implement authentication for admin endpoints
6. Set up proper logging and monitoring