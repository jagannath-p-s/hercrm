#!/bin/bash

# Define the components to be created
components=("Dashboard" "Members" "Memberships" "Finance" "Attendance" "Staff" "Equipment")

# Create a directory for the components if it doesn't exist
mkdir -p src/components

# Create each component file with a basic template
for component in "${components[@]}"
do
    component_file="src/components/${component}.jsx"
    if [ ! -f "$component_file" ]; then
        echo "Creating component: $component"
        cat > "$component_file" <<EOL
import React from 'react';

const ${component} = () => {
  return (
    <div>
      <h1>${component} Component</h1>
      <p>This is the ${component} component for the Herchamber Ladies Gym CRM.</p>
    </div>
  );
};

export default ${component};
EOL
    else
        echo "Component ${component} already exists!"
    fi
done

echo "All components have been created successfully!"
