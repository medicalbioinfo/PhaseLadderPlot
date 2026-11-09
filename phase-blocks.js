/* Phase Ladder Plot: consecutive phase-block segments and statistics.
 * All block metrics use the same segments, after region exclusion.
 * Coordinate spans remain last POS - first POS (not inclusive lengths).
 */
(function (root) {
  "use strict";

  function usable(rec) {
    return rec.status === "phased" && Boolean(rec.ps) && rec.ps !== ".";
  }

  function ordered(records, alreadyOrdered = false) {
    const phased = records.filter(usable);
    return alreadyOrdered ? phased : phased.sort((a, b) =>
      (a.chrom === b.chrom ? 0 : a.chrom.localeCompare(b.chrom)) || a.pos - b.pos);
  }

  // Another valid PS, even a singleton, interrupts a run. Missing-PS and
  // unphased sites cannot identify a PS change and do not interrupt runs.
  function consecutiveBlocks(records, minVariants, inExcluded, crossesExcluded, phasedRecords = null) {
    const blocks = [];
    let current = null;
    function flush() {
      if (current && current.count >= minVariants) blocks.push(current);
      current = null;
    }
    for (const rec of phasedRecords || ordered(records)) {
      // Retain excluded sites as boundaries; never count them in a segment.
      if (inExcluded(rec)) { flush(); continue; }
      if (!current || current.chrom !== rec.chrom || current.ps !== rec.ps ||
          crossesExcluded(rec.chrom, current.end, rec.pos)) {
        flush();
        current = { chrom: rec.chrom, ps: rec.ps, start: rec.pos, end: rec.pos, count: 1 };
      } else {
        current.end = rec.pos;
        current.count++;
      }
    }
    flush();
    return blocks;
  }

  function median(values) {
    if (!values.length) return NaN;
    const sorted = [...values].sort((a, b) => a - b), mid = sorted.length >>> 1;
    return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
  }

  function n50(values, target = values.reduce((sum, v) => sum + v, 0)) {
    if (!(target > 0)) return 0;
    let total = 0;
    for (const v of [...values].sort((a, b) => b - a)) {
      total += v;
      if (total >= target / 2) return v;
    }
    return 0;
  }

  // Caller supplies only autosomal segments outside excluded regions.
  // Basic heterozygous counts retain missing-PS calls; these calls are neither
  // block-assigned phased SNVs nor unphased GTs. The fraction uses all retained
  // heterozygous SNVs, including missing-PS calls and singleton runs.
  function segmentStats(blocks, contigLengths, counts) {
    const sizes = blocks.map(b => b.count);
    const lengths = blocks.map(b => b.end - b.start);
    const phased = sizes.reduce((a, b) => a + b, 0);
    const span = lengths.reduce((a, b) => a + b, 0);
    const stat = {
      variants: counts.biallelic,
      phased, phased_total: counts.validPhased, unphased: counts.unphased, blocks: blocks.length,
      variant_per_block_median: median(sizes),
      variant_per_block_avg: sizes.length ? phased / sizes.length : NaN,
      variant_per_block_max: sizes.reduce((a, b) => Math.max(a, b), 0),
      variant_per_block_sum: phased,
      bp_per_block_median: median(lengths),
      bp_per_block_avg: lengths.length ? span / lengths.length : NaN,
      bp_per_block_max: lengths.reduce((a, b) => Math.max(a, b), 0),
      bp_per_block_sum: span,
      heterozygous_variants: counts.het,
      phased_fraction: counts.het ? phased / counts.het : 0,
      block_n50: NaN,
      length_segments: blocks.length,
      length_n50: n50(lengths)
    };
    // Preserve the previous NG50 denominator: full header lengths of the
    // chromosomes represented by qualifying blocks, without subtracting gaps.
    const chromosomes = new Set(blocks.map(b => b.chrom));
    if (blocks.length && [...chromosomes].every(c =>
        Number.isFinite(contigLengths.get(c)) && contigLengths.get(c) > 0)) {
      const target = [...chromosomes].reduce((sum, c) => sum + contigLengths.get(c), 0);
      stat.block_n50 = n50(lengths, target);
    }
    return stat;
  }

  const api = { orderedPhasedRecords: ordered, consecutiveBlocks, segmentStats, n50 };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  root.PhaseBlocks = api;
})(typeof globalThis !== "undefined" ? globalThis : this);
