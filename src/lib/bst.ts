/**
 * Generic Binary Search Tree keyed by a numeric value.
 * Primary use: efficient price-range queries on PG listings.
 *
 * Range query: O(log n + k) vs Array.filter O(n)
 * Useful when listing count grows into the thousands.
 */

interface BSTNode<T> {
  key: number;
  values: T[];
  left: BSTNode<T> | null;
  right: BSTNode<T> | null;
}

export class BST<T> {
  private root: BSTNode<T> | null = null;
  private _size = 0;

  get size(): number {
    return this._size;
  }

  insert(key: number, value: T): void {
    this.root = this._insert(this.root, key, value);
    this._size++;
  }

  private _insert(node: BSTNode<T> | null, key: number, value: T): BSTNode<T> {
    if (node === null) return { key, values: [value], left: null, right: null };
    if (key === node.key) {
      node.values.push(value);
    } else if (key < node.key) {
      node.left = this._insert(node.left, key, value);
    } else {
      node.right = this._insert(node.right, key, value);
    }
    return node;
  }

  /** Returns all items whose key falls within [lo, hi] (inclusive). */
  rangeQuery(lo: number, hi: number): T[] {
    const result: T[] = [];
    this._range(this.root, lo, hi, result);
    return result;
  }

  private _range(node: BSTNode<T> | null, lo: number, hi: number, out: T[]): void {
    if (node === null) return;
    // Prune left subtree if all keys there are < lo
    if (node.key > lo) this._range(node.left, lo, hi, out);
    if (node.key >= lo && node.key <= hi) out.push(...node.values);
    // Prune right subtree if all keys there are > hi
    if (node.key < hi) this._range(node.right, lo, hi, out);
  }

  /** In-order traversal — returns all items sorted by key ascending. */
  inOrder(): T[] {
    const result: T[] = [];
    this._inOrder(this.root, result);
    return result;
  }

  private _inOrder(node: BSTNode<T> | null, out: T[]): void {
    if (node === null) return;
    this._inOrder(node.left, out);
    out.push(...node.values);
    this._inOrder(node.right, out);
  }

  /** Returns all items sorted by key descending. */
  inOrderDesc(): T[] {
    return this.inOrder().reverse();
  }
}

/**
 * Builds a BST from an array, keyed by a numeric extractor function.
 *
 * @example
 * const priceBST = buildBST(pgListings, (pg) => pg.price);
 * const affordable = priceBST.rangeQuery(5000, 9000);
 */
export function buildBST<T>(items: T[], keyFn: (item: T) => number): BST<T> {
  const tree = new BST<T>();
  for (const item of items) {
    tree.insert(keyFn(item), item);
  }
  return tree;
}
