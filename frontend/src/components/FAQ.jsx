import React from 'react';
import {
  Box,
  Container,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

const faqData = [
  {
    question: "How does the prediction system work?",
    answer: "Our system uses advanced machine learning algorithms to analyze students' academic and behavioral data and predict their future performance."
  },
  {
    question: "Is my data secure?",
    answer: "Absolutely. Data security and privacy are our top priority. All data is encrypted and stored securely."
  },
  {
    question: "Can I access the platform on mobile?",
    answer: "Yes, our platform is fully responsive and accessible on all devices, including smartphones and tablets."
  },
  {
    question: "How do I log in for a demo?",
    answer: "Choose a role, then use the demo username and password shown on the login screen for that role."
  }
];

const FAQ = () => {
  return (
    <Box
      sx={{
        py: 8,
        bgcolor: 'background.default',
      }}
      id="faq"
    >
      <Container maxWidth="md">
        <Typography
          variant="h2"
          align="center"
          gutterBottom
          sx={{ mb: 6 }}
        >
          Frequently Asked Questions
        </Typography>
        
        {faqData.map((faq, index) => (
          <Accordion key={index} elevation={0} sx={{ mb: 2, '&:before': { display: 'none' }, border: '1px solid #e0e0e0', borderRadius: '8px !important', overflow: 'hidden' }}>
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls={`panel${index}-content`}
              id={`panel${index}-header`}
            >
              <Typography variant="h6" component="h3" sx={{ fontSize: '1.1rem', fontWeight: 500 }}>
                {faq.question}
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography color="text.secondary">
                {faq.answer}
              </Typography>
            </AccordionDetails>
          </Accordion>
        ))}
      </Container>
    </Box>
  );
};

export default FAQ;
