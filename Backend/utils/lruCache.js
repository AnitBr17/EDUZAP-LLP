class LRUCache {
  constructor(limit = 50) {
    this.limit = limit;
    this.map = new Map();
  }
  get(key) {
    if (!this.map.has(key)) return null;
    const val = this.map.get(key);
    this.map.delete(key);
    this.map.set(key, val);
    return val;
  }
  set(key, value) {
    if (this.map.has(key)) this.map.delete(key);
    else if (this.map.size >= this.limit) {
      const firstKey = this.map.keys().next().value;
      this.map.delete(firstKey);
    }
    this.map.set(key, value);
  }
  del(key) { this.map.delete(key); }
  clear() { this.map.clear(); }
}
module.exports = LRUCache;
