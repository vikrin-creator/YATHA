function About() {
  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-4xl font-bold mb-6">About Yatha</h1>
      
      <div className="card space-y-4">
        <p className="text-gray-700 leading-relaxed">
          Yatha is a modern web application built with React, Tailwind CSS, and PHP.
        </p>
        
        <h2 className="text-2xl font-semibold mt-6">Technology Stack</h2>
        <ul className="list-disc list-inside space-y-2 text-gray-700">
          <li><strong>Frontend:</strong> React with Vite for fast development</li>
          <li><strong>Styling:</strong> Tailwind CSS for utility-first styling</li>
          <li><strong>Backend:</strong> PHP for server-side processing</li>
          <li><strong>Routing:</strong> React Router for navigation</li>
        </ul>
        
        <h2 className="text-2xl font-semibold mt-6">Getting Started</h2>
        <p className="text-gray-700 leading-relaxed">
          Follow the instructions in the README files to set up the development environment.
        </p>
      </div>
    </div>
  )
}

export default About
