class Greeter:
    def greet(self, name: str) -> str:
        return f"hello {name}"


def greet(name: str) -> str:
    return Greeter().greet(name)
