import React, { useState } from 'react';
import { Box } from 'grommet';
import { Title, Text, Select } from 'components/Base';
import * as styles from './faq-styles.styl';
import { Icon } from 'components/Base/components/Icons';
import { TOKEN } from '../../stores/interfaces';
import { LayoutCommon } from '../../components/Layouts/LayoutCommon/LayoutCommon';

const formsConfig = [
  {
    label: 'Error in the end',
    iframeUrl:
      'https://forms.helpdesk.com?licenseID=1447433401&contactFormID=0ea68569-a126-4cce-8b6f-7ec9a6ee4759',
  },
  {
    label: 'Wrapped token',
    iframeUrl:
      'https://forms.helpdesk.com?licenseID=1447433401&contactFormID=1430901b-62e2-4eea-a44e-7a60c960eb57',
  },
  {
    label: 'Funds are locked',
    iframeUrl:
      'https://forms.helpdesk.com?licenseID=1447433401&contactFormID=6a7c3bd6-cf1e-4b4f-b91f-1133b68e2fc3',
  },
  {
    label: 'Deposit withdrawal',
    iframeUrl:
      'https://forms.helpdesk.com?licenseID=1447433401&contactFormID=6d9caa8e-2f02-4d20-9503-687ed3cdfab2',
  },
  {
    label: 'Operation success, no tokens',
    iframeUrl:
      'https://forms.helpdesk.com?licenseID=1447433401&contactFormID=fb4de9c6-8f00-4e3b-b2e1-6df5763ff03b',
  },
];

export const SupportPage = () => {
  const [questionId, setQuestionId] = useState(-1);

  return (
    <LayoutCommon>
      <Box width="500px" justify="center" margin={{ top: '30px' }}>
        <iframe
          sandbox="allow-scripts allow-popups allow-forms allow-same-origin"
          width="100%"
          height="660px"
          style={{ border: 0, overflow: 'hidden', overflowX: 'auto' }}
          src="https://forms.helpdesk.com?licenseID=1447433401&contactFormID=495f2b1f-ac01-42fa-b21a-eb0b1f8b9cd7"
        >
          {' '}
          Your browser does not allow embedded content.{' '}
        </iframe>
      </Box>
    </LayoutCommon>
  );
};
