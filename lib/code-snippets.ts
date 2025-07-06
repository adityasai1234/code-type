// Sample code snippets for different languages and difficulty levels
export const codeSnippets: Record<string, Record<string, string[]>> = {
  javascript: {
    easy: [
      `function greet(name) {
  return "Hello, " + name + "!";
}

const message = greet("World");
console.log(message);`,
      `const numbers = [1, 2, 3, 4, 5];
const doubled = numbers.map(num => num * 2);
console.log(doubled);`,
      `let count = 0;
function increment() {
  count += 1;
  return count;
}

console.log(increment());
console.log(increment());`,
    ],
    medium: [
      `function fibonacci(n) {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}

for (let i = 0; i < 10; i++) {
  console.log(fibonacci(i));
}`,
      `const users = [
  { id: 1, name: "Alice", age: 25 },
  { id: 2, name: "Bob", age: 30 },
  { id: 3, name: "Charlie", age: 35 },
  { id: 4, name: "Dave", age: 40 }
];

const olderThan30 = users.filter(user => user.age > 30);
console.log(olderThan30);`,
      `function debounce(func, wait) {
  let timeout;
  return function(...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
}

const debouncedSearch = debounce(searchFunction, 300);`,
    ],
    hard: [
      `class BinarySearchTree {
  constructor() {
    this.root = null;
  }
  
  insert(value) {
    const newNode = { value, left: null, right: null };
    
    if (!this.root) {
      this.root = newNode;
      return;
    }
    
    let current = this.root;
    
    while (true) {
      if (value < current.value) {
        if (current.left === null) {
          current.left = newNode;
          return;
        }
        current = current.left;
      } else {
        if (current.right === null) {
          current.right = newNode;
          return;
        }
        current = current.right;
      }
    }
  }
}`,
      `async function fetchData(url) {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(\`HTTP error! status: \${response.status}\`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Fetch error:", error);
    throw error;
  }
}

fetchData("https://api.example.com/data")
  .then(data => console.log(data))
  .catch(error => console.error(error));`,
    ],
  },
  python: {
    easy: [
      `def greet(name):
    return f"Hello, {name}!"

message = greet("World")
print(message)`,
      `numbers = [1, 2, 3, 4, 5]
doubled = [num * 2 for num in numbers]
print(doubled)`,
      `count = 0
def increment():
    global count
    count += 1
    return count

print(increment())
print(increment())`,
    ],
    medium: [
      `def fibonacci(n):
    if n <= 1:
        return n
    return fibonacci(n - 1) + fibonacci(n - 2)

for i in range(10):
    print(fibonacci(i))`,
      `users = [
    {"id": 1, "name": "Alice", "age": 25},
    {"id": 2, "name": "Bob", "age": 30},
    {"id": 3, "name": "Charlie", "age": 35},
    {"id": 4, "name": "Dave", "age": 40}
]

older_than_30 = [user for user in users if user["age"] > 30]
print(older_than_30)`,
      `import time

def measure_time(func):
    def wrapper(*args, **kwargs):
        start_time = time.time()
        result = func(*args, **kwargs)
        end_time = time.time()
        print(f"Function {func.__name__} took {end_time - start_time:.4f} seconds to run")
        return result
    return wrapper

@measure_time
def slow_function():
    time.sleep(1)
    return "Done"

slow_function()`,
    ],
    hard: [
      `class Node:
    def __init__(self, value):
        self.value = value
        self.left = None
        self.right = None

class BinarySearchTree:
    def __init__(self):
        self.root = None
    
    def insert(self, value):
        new_node = Node(value)
        
        if self.root is None:
            self.root = new_node
            return
        
        current = self.root
        
        while True:
            if value < current.value:
                if current.left is None:
                    current.left = new_node
                    return
                current = current.left
            else:
                if current.right is None:
                    current.right = new_node
                    return
                current = current.right`,
      `import asyncio
import aiohttp

async def fetch_data(url):
    try:
        async with aiohttp.ClientSession() as session:
            async with session.get(url) as response:
                if response.status != 200:
                    raise Exception(f"HTTP error! status: {response.status}")
                data = await response.json()
                return data
    except Exception as error:
        print(f"Fetch error: {error}")
        raise error

async def main():
    try:
        data = await fetch_data("https://api.example.com/data")
        print(data)
    except Exception as error:
        print(f"Error in main: {error}")

asyncio.run(main())`,
    ],
  },
  java: {
    easy: [
      `public class HelloWorld {
    public static void main(String[] args) {
        System.out.println("Hello, World!");
    }
}`,
      `public class ArrayExample {
    public static void main(String[] args) {
        int[] numbers = {1, 2, 3, 4, 5};
        for (int num : numbers) {
            System.out.println(num * 2);
        }
    }
}`,
      `public class Counter {
    private static int count = 0;
    
    public static int increment() {
        count += 1;
        return count;
    }
    
    public static void main(String[] args) {
        System.out.println(increment());
        System.out.println(increment());
    }
}`,
    ],
    medium: [
      `public class Fibonacci {
    public static int fibonacci(int n) {
        if (n <= 1) return n;
        return fibonacci(n - 1) + fibonacci(n - 2);
    }
    
    public static void main(String[] args) {
        for (int i = 0; i < 10; i++) {
            System.out.println(fibonacci(i));
        }
    }
}`,
      `import java.util.ArrayList;
import java.util.List;

class User {
    int id;
    String name;
    int age;
    
    User(int id, String name, int age) {
        this.id = id;
        this.name = name;
        this.age = age;
    }
}

public class UserFilter {
    public static void main(String[] args) {
        List<User> users = new ArrayList<>();
        users.add(new User(1, "Alice", 25));
        users.add(new User(2, "Bob", 30));
        users.add(new User(3, "Charlie", 35));
        users.add(new User(4, "Dave", 40));
        
        List<User> olderThan30 = new ArrayList<>();
        for (User user : users) {
            if (user.age > 30) {
                olderThan30.add(user);
            }
        }
        
        System.out.println("Users older than 30: " + olderThan30.size());
    }
}`,
    ],
    hard: [
      `import java.util.ArrayList;
import java.util.List;

class Node {
    int value;
    Node left;
    Node right;
    
    Node(int value) {
        this.value = value;
        this.left = null;
        this.right = null;
    }
}

class BinarySearchTree {
    Node root;
    
    BinarySearchTree() {
        this.root = null;
    }
    
    void insert(int value) {
        Node newNode = new Node(value);
        
        if (root == null) {
            root = newNode;
            return;
        }
        
        Node current = root;
        
        while (true) {
            if (value < current.value) {
                if (current.left == null) {
                    current.left = newNode;
                    return;
                }
                current = current.left;
            } else {
                if (current.right == null) {
                    current.right = newNode;
                    return;
                }
                current = current.right;
            }
        }
    }
    
    public static void main(String[] args) {
        BinarySearchTree bst = new BinarySearchTree();
        bst.insert(10);
        bst.insert(5);
        bst.insert(15);
        bst.insert(2);
        bst.insert(7);
        System.out.println("Binary Search Tree created successfully");
    }
}`,
    ],
  },
  csharp: {
    easy: [
      `using System;

class Program
{
    static void Main()
    {
        Console.WriteLine("Hello, World!");
    }
}`,
      `using System;

class Program
{
    static void Main()
    {
        int[] numbers = { 1, 2, 3, 4, 5 };
        foreach (int num in numbers)
        {
            Console.WriteLine(num * 2);
        }
    }
}`,
      `using System;

class Counter
{
    private static int count = 0;
    
    public static int Increment()
    {
        count += 1;
        return count;
    }
    
    static void Main()
    {
        Console.WriteLine(Increment());
        Console.WriteLine(Increment());
    }
}`,
    ],
    medium: [
      `using System;

class Program
{
    static int Fibonacci(int n)
    {
        if (n <= 1) return n;
        return Fibonacci(n - 1) + Fibonacci(n - 2);
    }
    
    static void Main()
    {
        for (int i = 0; i < 10; i++)
        {
            Console.WriteLine(Fibonacci(i));
        }
    }
}`,
      `using System;
using System.Collections.Generic;
using System.Linq;

class User
{
    public int Id { get; set; }
    public string Name { get; set; }
    public int Age { get; set; }
    
    public User(int id, string name, int age)
    {
        Id = id;
        Name = name;
        Age = age;
    }
}

class Program
{
    static void Main()
    {
        List<User> users = new List<User>
        {
            new User(1, "Alice", 25),
            new User(2, "Bob", 30),
            new User(3, "Charlie", 35),
            new User(4, "Dave", 40)
        };
        
        var olderThan30 = users.Where(user => user.Age > 30).ToList();
        Console.WriteLine($"Users older than 30: {olderThan30.Count}");
    }
}`,
    ],
    hard: [
      `using System;

class Node
{
    public int Value { get; set; }
    public Node Left { get; set; }
    public Node Right { get; set; }
    
    public Node(int value)
    {
        Value = value;
        Left = null;
        Right = null;
    }
}

class BinarySearchTree
{
    private Node root;
    
    public BinarySearchTree()
    {
        root = null;
    }
    
    public void Insert(int value)
    {
        Node newNode = new Node(value);
        
        if (root == null)
        {
            root = newNode;
            return;
        }
        
        Node current = root;
        
        while (true)
        {
            if (value < current.Value)
            {
                if (current.Left == null)
                {
                    current.Left = newNode;
                    return;
                }
                current = current.Left;
            }
            else
            {
                if (current.Right == null)
                {
                    current.Right = newNode;
                    return;
                }
                current = current.Right;
            }
        }
    }
    
    static void Main()
    {
        BinarySearchTree bst = new BinarySearchTree();
        bst.Insert(10);
        bst.Insert(5);
        bst.Insert(15);
        bst.Insert(2);
        bst.Insert(7);
        Console.WriteLine("Binary Search Tree created successfully");
    }
}`,
    ],
  },
  typescript: {
    easy: [
      `function greet(name: string): string {
  return "Hello, " + name + "!";
}

const message: string = greet("World");
console.log(message);`,
      `const numbers: number[] = [1, 2, 3, 4, 5];
const doubled: number[] = numbers.map(num => num * 2);
console.log(doubled);`,
      `let count: number = 0;
function increment(): number {
  count += 1;
  return count;
}

console.log(increment());
console.log(increment());`,
    ],
    medium: [
      `function fibonacci(n: number): number {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}

for (let i = 0; i < 10; i++) {
  console.log(fibonacci(i));
}`,
      `interface User {
  id: number;
  name: string;
  age: number;
}

const users: User[] = [
  { id: 1, name: "Alice", age: 25 },
  { id: 2, name: "Bob", age: 30 },
  { id: 3, name: "Charlie", age: 35 },
  { id: 4, name: "Dave", age: 40 }
];

const olderThan30: User[] = users.filter(user => user.age > 30);
console.log(olderThan30);`,
      `function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  
  return function(...args: Parameters<T>): void {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

const debouncedSearch = debounce((query: string) => {
  console.log("Searching for:", query);
}, 300);

debouncedSearch("typescript");`,
    ],
    hard: [
      `class TreeNode<T> {
  value: T;
  left: TreeNode<T> | null;
  right: TreeNode<T> | null;
  
  constructor(value: T) {
    this.value = value;
    this.left = null;
    this.right = null;
  }
}

class BinarySearchTree<T> {
  root: TreeNode<T> | null;
  
  constructor() {
    this.root = null;
  }
  
  insert(value: T): void {
    const newNode = new TreeNode(value);
    
    if (!this.root) {
      this.root = newNode;
      return;
    }
    
    const insertNode = (node: TreeNode<T>, newNode: TreeNode<T>): void => {
      if (newNode.value < node.value) {
        if (node.left === null) {
          node.left = newNode;
        } else {
          insertNode(node.left, newNode);
        }
      } else {
        if (node.right === null) {
          node.right = newNode;
        } else {
          insertNode(node.right, newNode);
        }
      }
    };
    
    insertNode(this.root, newNode);
  }
}

const bst = new BinarySearchTree<number>();
bst.insert(10);
bst.insert(5);
bst.insert(15);
console.log("Binary Search Tree created successfully");`,
    ],
  },
}
