import React, { useState } from 'react';
import { Button, TextField } from '@mui/material';
import { User, updateProfile, getIdToken } from 'firebase/auth';

const ChangeName = ({ user }: { user: User }) => {
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState(user.displayName);

  return (
    <div>
      <h4>Change Name</h4>
      {error && <h5 style={{ textAlign: 'center' }}>{error}</h5>}

      <form
        noValidate
        onSubmit={async (e) => {
          e.preventDefault();
          updateProfile(user, {
            displayName: name,
          })
            .then(() => {
              getIdToken(user, true);
            })
            .catch((err) => {
              setError(err.code);
            });
        }}
      >
        <TextField
          required
          fullWidth
          id="name"
          label="New Name"
          name="name"
          autoComplete="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <Button
          type="submit"
          fullWidth
          variant="contained"
          sx={{ mt: 3, mb: 2 }}
        >
          Change Name
        </Button>
      </form>
    </div>
  );
};

export default ChangeName;
