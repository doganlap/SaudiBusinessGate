'use client';

import { useLingui } from '@lingui/react';

const TestPage = () => {
  const { _ } = useLingui();

  return (
    <div>
      <h1>{_('Test Page')}</h1>
      <p>{_('This is a test page to isolate the error.')}</p>
    </div>
  );
};

export default TestPage;