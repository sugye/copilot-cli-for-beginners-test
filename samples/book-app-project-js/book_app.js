const readline = require("readline");
const { BookCollection } = require("./books");

const collection = new BookCollection();

function showBooks(books) {
  if (!books || books.length === 0) {
    console.log("No books found.");
    return;
  }

  console.log("\nYour Book Collection:\n");

  books.forEach((book, index) => {
    const status = book.read ? "✓" : " ";
    console.log(`${index + 1}. [${status}] ${book.title} by ${book.author} (${book.year})`);
  });

  console.log();
}

function handleList() {
  const books = collection.listBooks();
  showBooks(books);
}

function prompt(question) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

async function handleAdd() {
  console.log("\nAdd a New Book\n");

  const title = await prompt("Title: ");
  const author = await prompt("Author: ");
  const yearStr = await prompt("Year: ");

  try {
    const year = yearStr ? parseInt(yearStr, 10) : 0;
    if (isNaN(year)) {
      throw new Error("Year must be a number.");
    }
    collection.addBook(title, author, year);
    console.log("\nBook added successfully.\n");
  } catch (err) {
    console.log(`\nError: ${err.message}\n`);
  }
}

function handleRemove() {
  return prompt("Enter the title of the book to remove: ").then((title) => {
    console.log("\nRemove a Book\n");
    collection.removeBook(title);
    console.log("\nBook removed if it existed.\n");
  });
}

async function handleFind() {
  console.log("\nFind Books by Author\n");

  const author = await prompt("Author name: ");
  const books = collection.findByAuthor(author);

  showBooks(books);
}

function showHelp() {
  console.log(`
Book Collection Helper

Commands:
  list     - Show all books
  add      - Add a new book (interactive or pass --title, --author, --year, --read)
  remove   - Remove a book by title
  find     - Find books by author
  help     - Show this help message
`);
}

function parseOptions(args) {
  // Simple parsing for --key=value and --flag
  const opts = {};
  args.forEach((arg) => {
    if (!arg.startsWith("--")) return;
    const eqIndex = arg.indexOf("=");
    if (eqIndex === -1) {
      // flag like --read
      const key = arg.slice(2);
      opts[key] = true;
    } else {
      const key = arg.slice(2, eqIndex);
      let val = arg.slice(eqIndex + 1);
      // strip surrounding quotes if any
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      opts[key] = val;
    }
  });
  return opts;
}

async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    showHelp();
    return;
  }

  const command = args[0].toLowerCase();

  switch (command) {
    case "list":
      handleList();
      break;
    case "add": {
      const options = parseOptions(args.slice(1));
      // If title and author are provided via flags, do a non-interactive add
      if (options.title && options.author) {
        const year = options.year ? parseInt(options.year, 10) : 0;
        if (options.year && isNaN(year)) {
          console.log("Error: --year must be a number.\n");
          break;
        }
        collection.addBook(options.title, options.author, year);
        if (options.read) {
          collection.markAsRead(options.title);
        }
        console.log("\nBook added successfully.\n");
      } else {
        await handleAdd();
      }
      break;
    }
    case "remove":
      await handleRemove();
      break;
    case "find":
      await handleFind();
      break;
    case "help":
      showHelp();
      break;
    default:
      console.log("Unknown command.\n");
      showHelp();
      break;
  }
}

main();
