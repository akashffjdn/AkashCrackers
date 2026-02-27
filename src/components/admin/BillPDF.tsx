import { Document, Page, View, Text, StyleSheet } from '@react-pdf/renderer';
import type { Bill } from '@/types/admin.ts';

// ─── Number to words (Indian system) ───

const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
  'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

function twoDigits(n: number): string {
  if (n < 20) return ones[n];
  return tens[Math.floor(n / 10)] + (n % 10 ? ' ' + ones[n % 10] : '');
}

function numberToWords(num: number): string {
  if (num === 0) return 'Zero';
  const n = Math.abs(Math.round(num));
  const crore = Math.floor(n / 10000000);
  const lakh = Math.floor((n % 10000000) / 100000);
  const thousand = Math.floor((n % 100000) / 1000);
  const hundred = Math.floor((n % 1000) / 100);
  const rest = n % 100;

  const parts: string[] = [];
  if (crore) parts.push(twoDigits(crore) + ' Crore');
  if (lakh) parts.push(twoDigits(lakh) + ' Lakh');
  if (thousand) parts.push(twoDigits(thousand) + ' Thousand');
  if (hundred) parts.push(ones[hundred] + ' Hundred');
  if (rest) parts.push(twoDigits(rest));

  return parts.join(' ') + ' Only';
}

// ─── Helpers ───

function fmt(n: number): string {
  return n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function fmtDate(iso: string): string {
  return new Date(iso).toLocaleString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit', hour12: true,
  });
}

// ─── Colors ───

const C = {
  primary: '#B91C1C',
  primaryLight: '#FEF2F2',
  dark: '#1F2937',
  text: '#374151',
  muted: '#6B7280',
  light: '#F9FAFB',
  border: '#E5E7EB',
  white: '#FFFFFF',
};

// ─── Styles ───

const s = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica',
    fontSize: 8,
    color: C.text,
    paddingTop: 24,
    paddingBottom: 80,
    paddingHorizontal: 28,
  },

  // Header band
  headerBand: {
    backgroundColor: C.primary,
    marginHorizontal: -28,
    marginTop: -24,
    paddingVertical: 16,
    paddingHorizontal: 28,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  shopName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: C.white,
    letterSpacing: 1,
  },
  shopTagline: {
    fontSize: 8,
    color: '#FCA5A5',
    marginTop: 2,
  },
  shopDetail: {
    fontSize: 7,
    color: '#FECACA',
    marginTop: 1,
  },
  invoiceLabel: {
    fontSize: 10,
    fontWeight: 'bold',
    color: C.white,
    textAlign: 'right',
  },
  invoiceMeta: {
    fontSize: 7.5,
    color: '#FECACA',
    textAlign: 'right',
    marginTop: 2,
  },

  // Info row (3 columns)
  infoRow: {
    flexDirection: 'row',
    marginTop: 14,
    gap: 8,
  },
  infoBox: {
    flex: 1,
    border: `1 solid ${C.border}`,
    borderRadius: 4,
    padding: 7,
  },
  infoTitle: {
    fontSize: 6,
    fontWeight: 'bold',
    color: C.muted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 3,
  },
  infoValue: {
    fontSize: 7.5,
    color: C.dark,
    marginTop: 1,
  },
  infoMuted: {
    fontSize: 6.5,
    color: C.muted,
    marginTop: 1,
  },

  // Table
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: C.primary,
    paddingVertical: 6,
    paddingHorizontal: 8,
    marginTop: 12,
  },
  tableHeaderText: {
    fontSize: 7,
    fontWeight: 'bold',
    color: C.white,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 5,
    paddingHorizontal: 8,
    borderBottom: `0.5 solid ${C.border}`,
  },
  tableRowAlt: {
    backgroundColor: C.light,
  },
  tableCell: {
    fontSize: 7.5,
    color: C.text,
  },
  tableCellBold: {
    fontSize: 7.5,
    color: C.dark,
    fontWeight: 'bold',
  },

  // Columns: #, Item, Qty, Rate, Disc, Amount
  colSno:  { width: 24 },
  colName: { flex: 1 },
  colQty:  { width: 36, textAlign: 'right' },
  colRate: { width: 60, textAlign: 'right' },
  colDisc: { width: 60, textAlign: 'right' },
  colAmt:  { width: 70, textAlign: 'right' },

  // Bottom bar (fixed)
  bottomBar: {
    position: 'absolute',
    bottom: 30,
    left: 28,
    right: 28,
    borderRadius: 4,
    overflow: 'hidden',
  },
  bottomRow1: {
    flexDirection: 'row',
    backgroundColor: C.primary,
    paddingVertical: 7,
    paddingHorizontal: 10,
  },
  bottomCol: {
    flex: 1,
    alignItems: 'center',
  },
  bottomColLabel: {
    fontSize: 6,
    color: '#FCA5A5',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  bottomColValue: {
    fontSize: 8,
    fontWeight: 'bold',
    color: C.white,
    marginTop: 1,
  },
  bottomColGrandValue: {
    fontSize: 11,
    fontWeight: 'bold',
    color: C.white,
    marginTop: 1,
    letterSpacing: 0.3,
  },
  bottomRow2: {
    backgroundColor: '#7F1D1D',
    paddingVertical: 5,
    paddingHorizontal: 10,
    alignItems: 'center',
  },
  bottomWordsText: {
    fontSize: 7,
    fontWeight: 'bold',
    color: '#FECACA',
    textAlign: 'center',
  },

  // Footer
  footer: {
    position: 'absolute',
    bottom: 14,
    left: 28,
    right: 28,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  footerText: {
    fontSize: 6,
    color: C.muted,
  },
});

// ─── Component ───

export function BillPDF({ bill }: { bill: Bill }) {
  return (
    <Document>
      <Page size="A4" style={s.page} wrap>

        {/* ═══ RED HEADER BAND (repeats on every page) ═══ */}
        <View style={s.headerBand} fixed>
          <View>
            <Text style={s.shopName}>AKASH CRACKERS</Text>
            <Text style={s.shopTagline}>Premium Fireworks Store</Text>
            <Text style={s.shopDetail}>Sivakasi, Virudhunagar, Tamil Nadu - 626123</Text>
            <Text style={s.shopDetail}>Ph: +91 98765 43210 | akashcrackers.com</Text>
          </View>
          <View>
            <Text style={s.invoiceLabel}>TAX INVOICE</Text>
            <Text style={s.invoiceMeta}>HSN: 3604 | GST: 18%</Text>
            <Text style={s.invoiceMeta}>GSTIN: 33AXXXXXXXXXXZ5</Text>
          </View>
        </View>

        {/* ═══ INFO ROW: Invoice | Customer + Payment | Terms ═══ */}
        <View style={s.infoRow}>
          {/* Invoice Details */}
          <View style={s.infoBox}>
            <Text style={s.infoTitle}>Invoice</Text>
            <Text style={s.infoValue}>{bill.billNumber}</Text>
            <Text style={s.infoValue}>{fmtDate(bill.createdAt)}</Text>
            <Text style={s.infoMuted}>Tamil Nadu (33)</Text>
          </View>

          {/* Customer & Payment */}
          <View style={s.infoBox}>
            <Text style={s.infoTitle}>Customer & Payment</Text>
            <Text style={s.infoValue}>{bill.customerName}</Text>
            <Text style={s.infoMuted}>{bill.customerPhone}</Text>
            <View style={{ borderTop: `0.5 solid ${C.border}`, marginTop: 4, paddingTop: 4 }}>
              <Text style={s.infoValue}>Paid via {bill.payment.method.toUpperCase()}</Text>
              {bill.payment.reference ? (
                <Text style={s.infoMuted}>Ref: {bill.payment.reference}</Text>
              ) : null}
              {bill.payment.receivedAmount != null && bill.payment.method === 'cash' && (
                <Text style={s.infoMuted}>Received: Rs. {fmt(bill.payment.receivedAmount)}{bill.payment.changeAmount && bill.payment.changeAmount > 0 ? `  |  Change: Rs. ${fmt(bill.payment.changeAmount)}` : ''}</Text>
              )}
            </View>
          </View>

          {/* Terms */}
          <View style={s.infoBox}>
            <Text style={s.infoTitle}>Terms</Text>
            <Text style={s.infoMuted}>1. Goods once sold will not be taken back.</Text>
            <Text style={s.infoMuted}>2. Handle fireworks with care.</Text>
            <Text style={s.infoMuted}>3. Subject to Sivakasi jurisdiction.</Text>
            <Text style={s.infoMuted}>E. & O.E.</Text>
          </View>
        </View>

        {/* ═══ TABLE HEADER (repeats on every page) ═══ */}
        <View style={s.tableHeader} fixed>
          <Text style={[s.tableHeaderText, s.colSno]}>#</Text>
          <Text style={[s.tableHeaderText, s.colName]}>Item</Text>
          <Text style={[s.tableHeaderText, s.colQty]}>Qty</Text>
          <Text style={[s.tableHeaderText, s.colRate]}>Rate</Text>
          {bill.discountPercent > 0 && (
            <Text style={[s.tableHeaderText, s.colDisc]}>Disc ({bill.discountPercent}%)</Text>
          )}
          <Text style={[s.tableHeaderText, s.colAmt]}>Amount</Text>
        </View>

        {/* ═══ TABLE ROWS ═══ */}
        {bill.items.map((item, i) => {
          const lineTotal = item.unitPrice * item.quantity;
          const lineDiscount = bill.discountPercent > 0 ? Math.round(lineTotal * bill.discountPercent / 100) : 0;
          return (
            <View key={item.productId + i} style={[s.tableRow, i % 2 === 1 ? s.tableRowAlt : {}]} wrap={false}>
              <Text style={[s.tableCell, s.colSno]}>{i + 1}</Text>
              <Text style={[s.tableCellBold, s.colName]}>{item.name}</Text>
              <Text style={[s.tableCell, s.colQty]}>{item.quantity}</Text>
              <Text style={[s.tableCell, s.colRate]}>{fmt(item.unitPrice)}</Text>
              {bill.discountPercent > 0 && (
                <Text style={[s.tableCell, s.colDisc, { color: '#16A34A' }]}>-{fmt(lineDiscount)}</Text>
              )}
              <Text style={[s.tableCellBold, s.colAmt]}>{fmt(lineTotal - lineDiscount)}</Text>
            </View>
          );
        })}

        {/* ═══ BOTTOM BAR (fixed at bottom on every page) ═══ */}
        <View style={s.bottomBar} fixed>
          {/* Row 1 — columns */}
          <View style={s.bottomRow1}>
            <View style={s.bottomCol}>
              <Text style={s.bottomColLabel}>Products</Text>
              <Text style={s.bottomColValue}>{bill.itemCount}</Text>
            </View>
            <View style={s.bottomCol}>
              <Text style={s.bottomColLabel}>CGST @ 9%</Text>
              <Text style={s.bottomColValue}>Rs. {fmt(bill.totalCgst)}</Text>
            </View>
            <View style={s.bottomCol}>
              <Text style={s.bottomColLabel}>SGST @ 9%</Text>
              <Text style={s.bottomColValue}>Rs. {fmt(bill.totalSgst)}</Text>
            </View>
            {bill.packagingFee > 0 && (
              <View style={s.bottomCol}>
                <Text style={s.bottomColLabel}>Packaging</Text>
                <Text style={s.bottomColValue}>Rs. {fmt(bill.packagingFee)}</Text>
              </View>
            )}
            <View style={s.bottomCol}>
              <Text style={s.bottomColLabel}>Total Qty</Text>
              <Text style={s.bottomColValue}>{bill.totalQuantity}</Text>
            </View>
            <View style={s.bottomCol}>
              <Text style={s.bottomColLabel}>Subtotal</Text>
              <Text style={s.bottomColValue}>Rs. {fmt(bill.subtotal)}</Text>
            </View>
            <View style={s.bottomCol}>
              <Text style={s.bottomColLabel}>Grand Total</Text>
              <Text style={s.bottomColGrandValue}>Rs. {fmt(bill.grandTotal)}</Text>
            </View>
          </View>
          {/* Row 2 — amount in words */}
          <View style={s.bottomRow2}>
            <Text style={s.bottomWordsText}>Rupees {numberToWords(bill.grandTotal)}</Text>
          </View>
        </View>

        {/* ═══ FOOTER ═══ */}
        <View style={s.footer} fixed>
          <Text style={s.footerText}>Computer-generated invoice  |  akashcrackers.com</Text>
        </View>

      </Page>
    </Document>
  );
}
