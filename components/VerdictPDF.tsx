import { Document, Page, Text, View, StyleSheet, Image, Font } from '@react-pdf/renderer';

// 1. Interfaces for Type Safety
interface Finding {
  item: string;
  status: 'PASS' | 'FAIL' | 'WARNING';
  fix: string;
  code_reference?: string; // New field from AI
  priority?: 'HIGH' | 'MEDIUM' | 'LOW';
  image_url?: string;
}

interface TechnicianNotes {
  summary: string;
  confidence_score: number;
  findings: Finding[];
}

interface VerdictData {
  property_address: string;
  trade_type: string;
  status: string;
  technician_notes: TechnicianNotes;
}

interface VerdictPDFProps {
  data: VerdictData;
}

// 2. Consolidated Styles
const styles = StyleSheet.create({
  page: { padding: 40, backgroundColor: '#FFFFFF', fontFamily: 'Helvetica' },
  header: { marginBottom: 20, borderBottom: 2, borderBottomColor: '#2563eb', paddingBottom: 10 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#0f172a' },
  address: { fontSize: 12, color: '#64748b', marginTop: 4 },
  section: { marginTop: 20 },
  heading: { fontSize: 14, fontWeight: 'bold', color: '#1e293b', marginBottom: 12, textTransform: 'uppercase' },
  findingBox: { 
    padding: 12, 
    borderLeft: 4, 
    marginBottom: 12, 
    backgroundColor: '#f8fafc',
    flexDirection: 'row', 
    justifyContent: 'space-between',
    alignItems: 'flex-start'
  },
  fail: { borderLeftColor: '#f59e0b' },
  pass: { borderLeftColor: '#10b981' },
  textContainer: { flex: 1, paddingRight: 15 },
  itemTitle: { fontSize: 13, fontWeight: 'bold', color: '#0f172a' },
  itemFix: { fontSize: 10, color: '#475569', marginTop: 4, lineHeight: 1.4 },
  
  // New Code Reference Badge Style
  codeBadge: {
    fontSize: 8,
    backgroundColor: '#e2e8f0',
    color: '#475569',
    padding: '2 6',
    borderRadius: 4,
    marginTop: 6,
    alignSelf: 'flex-start',
    textTransform: 'uppercase'
  },
  
  evidenceImage: { 
    width: 140, 
    height: 90, 
    borderRadius: 6, 
    border: 1,
    borderColor: '#e2e8f0'
  },
  footer: { position: 'absolute', bottom: 30, left: 40, right: 40, fontSize: 9, color: '#94a3b8', textAlign: 'center' }
});

// 3. Single Component Export
export const VerdictPDF = ({ data }: VerdictPDFProps) => {
  const findings = data?.technician_notes?.findings || [];

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Branding & Property Header */}
        <View style={styles.header}>
          <Text style={styles.title}>SiteVerdict Technical Audit</Text>
          <Text style={styles.address}>{data.property_address || 'Address Not Provided'}</Text>
        </View>

        {/* Audit Metadata */}
        <View style={styles.section}>
          <Text style={styles.heading}>Audit Summary</Text>
          <Text style={{ fontSize: 11, color: '#475569' }}>
            Trade: {data.trade_type} | Confidence Score: {((data.technician_notes?.confidence_score || 0) * 100).toFixed(0)}%
          </Text>
        </View>

        {/* Findings with Code References */}
        <View style={styles.section}>
          <Text style={styles.heading}>Findings & Photo Evidence</Text>
          {findings.map((f, i) => (
            <View 
              key={i} 
              style={[
                styles.findingBox, 
                f.status === 'FAIL' ? styles.fail : styles.pass
              ]} 
              wrap={false}
            >
              <View style={styles.textContainer}>
                <Text style={styles.itemTitle}>{f.item} — {f.status}</Text>
                
                {/* Code Reference Badge */}
                {f.code_reference && (
                  <Text style={styles.codeBadge}>Compliance: {f.code_reference}</Text>
                )}

                <Text style={styles.itemFix}>{f.fix}</Text>
              </View>
              
              {f.image_url && (
                <Image 
                  src={f.image_url} 
                  style={styles.evidenceImage} 
                />
              )}
            </View>
          ))}
        </View>

        <Text style={styles.footer}>
          Verified by SiteVerdict.online AI Pilot — Santa Cruz County (CBC/CRC Compliance).
        </Text>
      </Page>
    </Document>
  );
};