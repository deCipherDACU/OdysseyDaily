import React from 'react';
import { useUser } from '@/context/UserContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const CharacterPreview = () => {
  const { user } = useUser();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Character Preview</CardTitle>
      </CardHeader>
      <CardContent>
        <div
          style={{
            width: '100%',
            height: '200px',
            backgroundColor: '#eee',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            borderRadius: '0.5rem',
          }}
        >
          <p>3D Model Placeholder</p>
        </div>
      </CardContent>
    </Card>
  );
};
