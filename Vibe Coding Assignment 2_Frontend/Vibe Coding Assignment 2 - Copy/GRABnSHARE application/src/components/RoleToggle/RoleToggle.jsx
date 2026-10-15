import './RoleToggle.css'

function RoleToggle({ selectedRole, onRoleChange, legend = 'I am a:' }) {
  return (
    <fieldset className="role-toggle" aria-label="Select your role">
      <legend className="role-toggle-legend">{legend}</legend>
      <div className="role-toggle-options">
        <button
          type="button"
          className={`role-toggle-option ${
            selectedRole === 'student' ? 'role-toggle-option--selected' : ''
          }`}
          onClick={() => onRoleChange('student')}
          aria-pressed={selectedRole === 'student'}
        >
          Student
        </button>
        <button
          type="button"
          className={`role-toggle-option ${
            selectedRole === 'organiser' ? 'role-toggle-option--selected' : ''
          }`}
          onClick={() => onRoleChange('organiser')}
          aria-pressed={selectedRole === 'organiser'}
        >
          Organiser
        </button>
      </div>
    </fieldset>
  )
}

export default RoleToggle